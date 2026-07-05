import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CrmService {
  constructor(private prisma: PrismaService) {}

  // ─── STATS ──────────────────────────────────────────────────────
  async getCrmStats(companyId: string) {
    const [totalCustomers, totalLeads, openDeals, totalDealValue] = await Promise.all([
      this.prisma.customer.count({ where: { companyId } }),
      this.prisma.lead.count({ where: { companyId } }),
      this.prisma.deal.count({ where: { companyId, stage: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] } } }),
      this.prisma.deal.aggregate({ where: { companyId, stage: 'CLOSED_WON' }, _sum: { value: true } }),
    ]);
    return { totalCustomers, totalLeads, openDeals, totalDealValue: totalDealValue._sum.value || 0 };
  }

  // ─── CUSTOMERS ─────────────────────────────────────────────────
  async getCustomers(companyId: string) {
    return this.prisma.customer.findMany({
      where: { companyId },
      include: { _count: { select: { deals: true, invoices: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCustomer(id: string) {
    const c = await this.prisma.customer.findUnique({
      where: { id },
      include: { deals: true, invoices: { include: { items: true } } },
    });
    if (!c) throw new NotFoundException('Customer not found');
    return c;
  }

  async createCustomer(companyId: string, data: any) {
    return this.prisma.customer.create({ data: { ...data, companyId } });
  }

  async updateCustomer(id: string, data: any) {
    return this.prisma.customer.update({ where: { id }, data });
  }

  async deleteCustomer(id: string) {
    return this.prisma.customer.delete({ where: { id } });
  }

  // ─── LEADS ─────────────────────────────────────────────────────
  async getLeads(companyId: string) {
    return this.prisma.lead.findMany({
      where: { companyId },
      orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createLead(companyId: string, data: any) {
    return this.prisma.lead.create({ data: { ...data, companyId } });
  }

  async updateLead(id: string, data: any) {
    return this.prisma.lead.update({ where: { id }, data });
  }

  async deleteLead(id: string) {
    return this.prisma.lead.delete({ where: { id } });
  }

  // ─── DEALS / PIPELINE ──────────────────────────────────────────
  async getDeals(companyId: string) {
    return this.prisma.deal.findMany({
      where: { companyId },
      include: { customer: { select: { name: true, email: true } } },
      orderBy: { value: 'desc' },
    });
  }

  async createDeal(companyId: string, data: any) {
    return this.prisma.deal.create({ data: { ...data, companyId } });
  }

  async updateDeal(id: string, data: any) {
    return this.prisma.deal.update({ where: { id }, data });
  }

  async deleteDeal(id: string) {
    return this.prisma.deal.delete({ where: { id } });
  }
}
