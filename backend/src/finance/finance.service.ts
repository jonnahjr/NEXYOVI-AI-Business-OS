import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  // ─── STATS ──────────────────────────────────────────────────────
  async getStats(companyId: string) {
    const [totalInvoices, paidInvoices, overdueInvoices, totalRevenue, totalExpenses, pendingExpenses] = await Promise.all([
      this.prisma.invoice.count({ where: { companyId } }),
      this.prisma.invoice.count({ where: { companyId, status: 'PAID' } }),
      this.prisma.invoice.count({ where: { companyId, status: 'OVERDUE' } }),
      this.prisma.invoice.aggregate({ where: { companyId, status: 'PAID' }, _sum: { total: true } }),
      this.prisma.expense.aggregate({ where: { companyId, status: 'APPROVED' }, _sum: { amount: true } }),
      this.prisma.expense.count({ where: { companyId, status: 'PENDING' } }),
    ]);
    return {
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      totalRevenue: totalRevenue._sum.total || 0,
      totalExpenses: totalExpenses._sum.amount || 0,
      netProfit: (totalRevenue._sum.total || 0) - (totalExpenses._sum.amount || 0),
      pendingExpenses,
    };
  }

  // ─── INVOICES ──────────────────────────────────────────────────
  async getInvoices(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { companyId },
      include: {
        customer: { select: { name: true, email: true } },
        items: true,
      },
      orderBy: { issueDate: 'desc' },
    });
  }

  async getInvoice(id: string) {
    const inv = await this.prisma.invoice.findUnique({
      where: { id },
      include: { customer: true, items: { include: { product: { select: { name: true, sku: true } } } } },
    });
    if (!inv) throw new NotFoundException('Invoice not found');
    return inv;
  }

  async createInvoice(companyId: string, data: {
    customerId?: string;
    dueDate?: string;
    notes?: string;
    taxRate?: number;
    items: { description: string; quantity: number; unitPrice: number; productId?: string }[];
  }) {
    const subTotal = data.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    const taxAmount = subTotal * (data.taxRate || 0.15);
    const total = subTotal + taxAmount;
    const invoiceNo = `INV-${Date.now()}`;

    return this.prisma.invoice.create({
      data: {
        companyId,
        invoiceNo,
        customerId: data.customerId,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        notes: data.notes,
        subTotal,
        taxAmount,
        total,
        items: {
          create: data.items.map(i => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            total: i.quantity * i.unitPrice,
            productId: i.productId,
          })),
        },
      },
      include: { items: true },
    });
  }

  async updateInvoiceStatus(id: string, status: any) {
    return this.prisma.invoice.update({ where: { id }, data: { status } });
  }

  async deleteInvoice(id: string) {
    return this.prisma.invoice.delete({ where: { id } });
  }

  // ─── EXPENSES ──────────────────────────────────────────────────
  async getExpenses(companyId: string) {
    return this.prisma.expense.findMany({
      where: { companyId },
      orderBy: { date: 'desc' },
    });
  }

  async createExpense(companyId: string, data: any) {
    return this.prisma.expense.create({ data: { ...data, companyId } });
  }

  async updateExpenseStatus(id: string, status: any) {
    return this.prisma.expense.update({ where: { id }, data: { status } });
  }

  async deleteExpense(id: string) {
    return this.prisma.expense.delete({ where: { id } });
  }

  // ─── REPORTS ───────────────────────────────────────────────────
  async getMonthlyReport(companyId: string, year: number) {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const report = await Promise.all(
      months.map(async month => {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);
        const [revenue, expenses] = await Promise.all([
          this.prisma.invoice.aggregate({
            where: { companyId, status: 'PAID', issueDate: { gte: start, lte: end } },
            _sum: { total: true },
          }),
          this.prisma.expense.aggregate({
            where: { companyId, status: 'APPROVED', date: { gte: start, lte: end } },
            _sum: { amount: true },
          }),
        ]);
        return {
          month,
          revenue: revenue._sum.total || 0,
          expenses: expenses._sum.amount || 0,
          profit: (revenue._sum.total || 0) - (expenses._sum.amount || 0),
        };
      }),
    );
    return report;
  }
}
