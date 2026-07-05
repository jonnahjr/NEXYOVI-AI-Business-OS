import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // ─── STATS ──────────────────────────────────────────────────────
  async getStats(companyId: string) {
    const [totalProducts, lowStockProducts, totalStockValue, totalPurchases] = await Promise.all([
      this.prisma.product.count({ where: { companyId, isActive: true } }),
      this.prisma.product.count({ where: { companyId, isActive: true, stock: { lte: this.prisma.product.fields.minStock } } }).catch(() =>
        this.prisma.product.findMany({ where: { companyId }, select: { stock: true, minStock: true } }).then(ps => ps.filter(p => p.stock <= p.minStock).length)
      ),
      this.prisma.product.aggregate({ where: { companyId }, _sum: { stock: true } }),
      this.prisma.purchase.count({ where: { companyId } }),
    ]);
    return { totalProducts, lowStockProducts, totalStockValue: totalStockValue._sum.stock || 0, totalPurchases };
  }

  // ─── PRODUCTS ──────────────────────────────────────────────────
  async getProducts(companyId: string) {
    return this.prisma.product.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
  }

  async getLowStockProducts(companyId: string) {
    const products = await this.prisma.product.findMany({ where: { companyId, isActive: true } });
    return products.filter(p => p.stock <= p.minStock);
  }

  async getProduct(id: string) {
    const p = await this.prisma.product.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async createProduct(companyId: string, data: any) {
    return this.prisma.product.create({ data: { ...data, companyId } });
  }

  async updateProduct(id: string, data: any) {
    return this.prisma.product.update({ where: { id }, data });
  }

  async deleteProduct(id: string) {
    return this.prisma.product.update({ where: { id }, data: { isActive: false } });
  }

  async adjustStock(id: string, quantity: number, type: 'ADD' | 'SUBTRACT') {
    const product = await this.getProduct(id);
    const newStock = type === 'ADD' ? product.stock + quantity : product.stock - quantity;
    return this.prisma.product.update({ where: { id }, data: { stock: Math.max(0, newStock) } });
  }

  // ─── PURCHASES ──────────────────────────────────────────────────
  async getPurchases(companyId: string) {
    return this.prisma.purchase.findMany({
      where: { companyId },
      include: { items: { include: { product: { select: { name: true, sku: true } } } } },
      orderBy: { orderDate: 'desc' },
    });
  }

  async createPurchase(companyId: string, data: { supplierName?: string; notes?: string; items: { productId: string; quantity: number; unitCost: number }[] }) {
    const total = data.items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
    const purchaseNo = `PO-${Date.now()}`;

    const purchase = await this.prisma.purchase.create({
      data: {
        companyId,
        purchaseNo,
        supplierName: data.supplierName,
        notes: data.notes,
        total,
        items: {
          create: data.items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            unitCost: i.unitCost,
            total: i.quantity * i.unitCost,
          })),
        },
      },
      include: { items: true },
    });

    // Auto update stock when purchase received
    for (const item of data.items) {
      await this.adjustStock(item.productId, item.quantity, 'ADD');
    }

    return purchase;
  }

  async updatePurchaseStatus(id: string, status: any) {
    return this.prisma.purchase.update({ where: { id }, data: { status } });
  }
}
