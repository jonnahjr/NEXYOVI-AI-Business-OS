import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * GenericModuleService – a universal data hub for all 17 pillar modules.
 */
@Injectable()
export class GenericModuleService {
  private readonly PAYROLL_SETTINGS_DEFAULTS = {
    includeAttendanceOvertime: true,
    includeAbsenceDeductions: true,
    includeLatePenalties: true,
    includeUnpaidLeaveDeductions: true,
    includeBonuses: true,
    autoCalculateTax: true,
    includePension: true,
    useWorkDayBasedPay: false,
  };

  constructor(private prisma: PrismaService) {}

  private getModelDelegate(pillarSlug: string, moduleSlug: string) {
    const key = `${pillarSlug}::${moduleSlug}`;
    switch (key) {
      // ── CRM & SALES ─────────────────────────────────────────────
      case 'crm-sales::lead-management':
      case 'crm-sales::leads': return this.prisma.lead;
      case 'crm-sales::opportunity-pipeline': return this.prisma.deal;
      case 'crm-sales::customer-management': return this.prisma.customer;
      case 'crm-sales::contact-management': return this.prisma.customer;
      case 'crm-sales::invoicing': return this.prisma.invoice;
      case 'crm-sales::contracts': return this.prisma.contract;


      // ── INVENTORY & WAREHOUSE (all 13 modules) ────────────────────
      case 'inventory-warehouse::products': return this.prisma.product;
      case 'inventory-warehouse::categories': return this.prisma.product; // derived from Product.category
      case 'inventory-warehouse::warehouses': return this.prisma.warehouse;
      case 'inventory-warehouse::stock-management': return this.prisma.product;
      case 'inventory-warehouse::batch-serial-numbers': return this.prisma.productBatch;
      case 'inventory-warehouse::barcode-qr': return this.prisma.product;
      case 'inventory-warehouse::purchase-orders': return this.prisma.purchase;
      case 'inventory-warehouse::goods-receipt': return this.prisma.stockMovement;
      case 'inventory-warehouse::stock-transfers': return this.prisma.stockMovement;
      case 'inventory-warehouse::cycle-counts': return this.prisma.cycleCount;
      case 'inventory-warehouse::inventory-forecasting': return this.prisma.product;
      case 'inventory-warehouse::supplier-stock': return this.prisma.product;
      case 'inventory-warehouse::warehouse-analytics': return this.prisma.product;

      // ── FINANCE & ACCOUNTING (all 13 modules) ─────────────────────
      case 'finance-accounting::budgeting':           return this.prisma.budget;
      case 'finance-accounting::expenses':            return this.prisma.expense;
      case 'finance-accounting::invoicing':           return this.prisma.invoice;
      case 'finance-accounting::fixed-assets':        return this.prisma.fixedAsset;
      case 'finance-accounting::general-ledger':      return this.prisma.journalEntry;
      case 'finance-accounting::accounts-payable':
      case 'finance-accounting::accounts-receivable':
        return this.prisma.invoice;  // AP/AR operate on invoices transparently
      case 'finance-accounting::tax-vat':            return this.prisma.vatEntry;
      case 'finance-accounting::banking':
      case 'finance-accounting::cash-flow':
      case 'finance-accounting::financial-statements':
      case 'finance-accounting::multi-currency':
      case 'finance-accounting::audit-trail':
      case 'finance-accounting::financial-analytics':
        return null;

      // ── PROCUREMENT ──────────────────────────────────────────────
      case 'procurement::vendor-management': return this.prisma.vendor;
      case 'procurement::supplier-portal': return this.prisma.vendor;
      case 'procurement::purchase-requests': return this.prisma.purchase;
      case 'procurement::rfqs': return this.prisma.rfq;
      case 'procurement::contract-management': return this.prisma.contract;
      case 'procurement::approval-workflow': return this.prisma.approvalWorkflow;
      case 'procurement::tender-management': return this.prisma.tender;
      case 'procurement::procurement-analytics':
        return null;

      // ── MANUFACTURING ───────────────────────────────────────────────
      case 'manufacturing::production-planning': return this.prisma.workOrder;
      case 'manufacturing::work-orders': return this.prisma.workOrder;
      case 'manufacturing::machine-monitoring': return this.prisma.machine;
      case 'manufacturing::maintenance': return this.prisma.maintenanceRecord;
      case 'manufacturing::quality-control': return this.prisma.qualityCheck;
      case 'manufacturing::production-scheduling': return this.prisma.productionSchedule;
      case 'manufacturing::bills-of-materials-bom': return this.prisma.billOfMaterial;
      case 'manufacturing::manufacturing-analytics': return null;
      // ── PROJECT MANAGEMENT ───────────────────────────────────────
      case 'project-management::projects': return this.prisma.project;

      // ── DOCUMENT MANAGEMENT ──────────────────────────────────────
            case 'document-management::documents':
      case 'document-management::file-storage': return this.prisma.document;
      case 'document-management::version-control': return this.prisma.documentVersion;
      case 'document-management::ocr': return this.prisma.ocrRecord;
      case 'document-management::ai-document-search':
      case 'document-management::pdf-generation': return this.prisma.document;
      case 'document-management::digital-signatures': return this.prisma.digitalSignature;
      case 'document-management::templates': return this.prisma.documentTemplate;

      // ── MARKETING ────────────────────────────────────────────────
      case 'marketing::campaigns': return this.prisma.marketingCampaign;

      // ── LOGISTICS & FLEET ────────────────────────────────────────
      case 'logistics-fleet::vehicles': return this.prisma.vehicle;
      case 'logistics-fleet::drivers': return this.prisma.driver;

      // ── HUMAN RESOURCES ──────────────────────────────────────────
      case 'human-resources::employee-management': return this.prisma.employee;
      case 'human-resources::recruitment-ats': return this.prisma.recruitmentCandidate;
      case 'human-resources::job-posting': return this.prisma.jobPosting;
      case 'human-resources::onboarding': return this.prisma.onboardingTask;
      case 'human-resources::attendance': return this.prisma.attendance;
      case 'human-resources::leave-management': return this.prisma.leave;
      case 'human-resources::payroll': return this.prisma.payroll;
      case 'human-resources::performance-management': return this.prisma.performanceReview;
      case 'human-resources::learning-training-lms': return this.prisma.trainingCourse;
      case 'human-resources::benefits': return this.prisma.employeeBenefit;
      case 'human-resources::employee-self-service': return this.prisma.hrHelpRequest;
      case 'human-resources::organizational-chart': return this.prisma.employee;
      case 'human-resources::time-tracking': return this.prisma.timeSheet;
      case 'human-resources::shift-scheduling': return this.prisma.shiftSchedule;
      case 'human-resources::exit-management': return this.prisma.exitInterview;
      case 'human-resources::hr-analytics': return this.prisma.hrAnalyticsMetric;

      default:
        return null;
    }
  }

  async getData(pillarSlug: string, moduleSlug: string, companyId: string): Promise<any[]> {
    // If no companyId from token, fall back to first company in DB
    if (!companyId) {
      const firstCompany = await this.prisma.company.findFirst();
      companyId = firstCompany?.id ?? '';
    }

    // ── MOCK DATA FOR CRM MODULES WITHOUT DEDICATED MODELS ───────────
    if (pillarSlug === 'crm-sales') {
      if (moduleSlug === 'sales-quotes') {
        return [
          { quoteNo: 'Q-2025-001', customer: 'Sunrise PLC', date: '2025-06-01', expiryDate: '2025-07-01', amount: 250000, status: 'Sent' },
          { quoteNo: 'Q-2025-002', customer: 'Green Valley Ltd', date: '2025-06-10', expiryDate: '2025-07-10', amount: 180000, status: 'Draft' },
          { quoteNo: 'Q-2025-003', customer: 'Addis Tech', date: '2025-06-20', expiryDate: '2025-07-20', amount: 480000, status: 'Accepted' },
          { quoteNo: 'Q-2025-004', customer: 'Blue Nile Exports', date: '2025-06-25', expiryDate: '2025-07-25', amount: 120000, status: 'Declined' },
        ];
      }
      if (moduleSlug === 'orders') {
        return [
          { orderNo: 'ORD-2025-001', customer: 'Sunrise PLC', date: '2025-06-15', items: 3, amount: 250000, status: 'Processing' },
          { orderNo: 'ORD-2025-002', customer: 'Green Valley Ltd', date: '2025-06-20', items: 1, amount: 85000, status: 'Shipped' },
          { orderNo: 'ORD-2025-003', customer: 'Addis Tech', date: '2025-06-25', items: 5, amount: 480000, status: 'Pending' },
        ];
      }
      if (moduleSlug === 'sales-forecasting') {
        return [
          { period: 'Q3 2026', pipeline: 4500000, forecast: 3200000, weighted: 2150000, closed: 850000, confidence: 'High' },
          { period: 'Q4 2026', pipeline: 6200000, forecast: 4100000, weighted: 2800000, closed: 0, confidence: 'Medium' },
          { period: 'Q1 2027', pipeline: 2800000, forecast: 1800000, weighted: 900000, closed: 0, confidence: 'Low' },
        ];
      }
      if (moduleSlug === 'customer-support') {
        return [
          { ticketNo: 'SUP-001', customer: 'Sunrise PLC', subject: 'Login issue with dashboard', priority: 'High', status: 'Open', createdAt: '2026-07-01' },
          { ticketNo: 'SUP-002', customer: 'Green Valley Ltd', subject: 'Invoice payment not reflecting', priority: 'Urgent', status: 'In Progress', createdAt: '2026-07-03' },
          { ticketNo: 'SUP-003', customer: 'Addis Tech', subject: 'User permission request', priority: 'Low', status: 'Resolved', createdAt: '2026-06-28' },
          { ticketNo: 'SUP-004', customer: 'Blue Nile Exports', subject: 'Report export not working', priority: 'Medium', status: 'Open', createdAt: '2026-07-05' },
        ];
      }
      if (moduleSlug === 'customer-portal') {
        return [
          { name: 'Sunrise PLC', portalUrl: 'portal.nexyovi.com/sunrise', users: 12, lastLogin: '2026-07-05', status: 'Active' },
          { name: 'Green Valley Ltd', portalUrl: 'portal.nexyovi.com/greenvalley', users: 8, lastLogin: '2026-07-02', status: 'Active' },
          { name: 'Addis Tech', portalUrl: 'portal.nexyovi.com/addistech', users: 5, lastLogin: '2026-06-20', status: 'Active' },
        ];
      }
      if (moduleSlug === 'loyalty-programs') {
        return [
          { name: 'Platinum Rewards', members: 45, tier: 'Platinum', points: 125000, revenue: 850000, status: 'Active' },
          { name: 'Gold Club', members: 128, tier: 'Gold', points: 42000, revenue: 320000, status: 'Active' },
          { name: 'Silver Saver', members: 340, tier: 'Silver', points: 15000, revenue: 120000, status: 'Active' },
        ];
      }
      if (moduleSlug === 'sales-analytics') {
        return [
          { metric: 'Monthly Revenue', current: 1200000, target: 1500000, achieved: 80, trend: 'Up' },
          { metric: 'New Leads', current: 85, target: 100, achieved: 85, trend: 'Stable' },
          { metric: 'Deals Closed', current: 8, target: 12, achieved: 67, trend: 'Down' },
          { metric: 'Avg. Deal Size', current: 340000, target: 400000, achieved: 85, trend: 'Up' },
          { metric: 'Win Rate', current: 62, target: 70, achieved: 89, trend: 'Up' },
          { metric: 'Customer Acq. Cost', current: 28000, target: 25000, achieved: 112, trend: 'Up' },
        ];
      }
    }

    const delegate = this.getModelDelegate(pillarSlug, moduleSlug) as any;

    try {
      // ── PRODUCTS ─────────────────────────────────────────────────
      if (delegate === this.prisma.product && moduleSlug === 'products') {
        return delegate.findMany({ where: { companyId }, select: { id: true, sku: true, name: true, barcode: true, category: true, stock: true, unit: true, sellPrice: true, costPrice: true, minStock: true, isActive: true }, orderBy: { name: 'asc' } });
      }
      // ── CATEGORIES (derived from Product category field) ─────────
      if (delegate === this.prisma.product && moduleSlug === 'categories') {
        const products = await delegate.findMany({ where: { companyId }, select: { category: true } });
        const catMap: Record<string, number> = {};
        products.forEach((p: any) => {
          const cat = p.category || 'Uncategorized';
          catMap[cat] = (catMap[cat] || 0) + 1;
        });
        return Object.entries(catMap).map(([name, count], idx) => ({
          id: `cat-${idx}`,
          name,
          productCount: count,
          status: 'Active',
        }));
      }
      // ── STOCK MANAGEMENT (Products with stock levels & reorder info) ──
      if (delegate === this.prisma.product && moduleSlug === 'stock-management') {
        const products = await delegate.findMany({
          where: { companyId },
          select: { id: true, sku: true, name: true, category: true, stock: true, minStock: true, maxStock: true, unit: true, sellPrice: true, costPrice: true },
          orderBy: { name: 'asc' },
        });
        return products.map((p: any) => {
          const stock = p.stock || 0;
          const minStock = p.minStock || 0;
          const maxStock = p.maxStock || 0;
          return {
            id: p.id,
            sku: p.sku,
            product: p.name,
            category: p.category || '',
            currentStock: stock,
            minStock,
            maxStock,
            unit: p.unit,
            sellPrice: p.sellPrice,
            reorderPoint: Math.round(minStock * 1.5),
            status: stock <= 0 ? 'Out of Stock' : stock <= minStock ? 'Low Stock' : 'In Stock',
          };
        });
      }
      // ── BARCODE / QR (Products with barcode) ──────────────────────
      if (delegate === this.prisma.product && moduleSlug === 'barcode-qr') {
        const records = await delegate.findMany({
          where: { companyId },
          select: { id: true, sku: true, name: true, barcode: true, category: true, stock: true, sellPrice: true, unit: true, isActive: true },
          orderBy: { name: 'asc' },
        });
        return records.map((p: any) => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          barcode: p.barcode || '',
          category: p.category || '',
          stock: p.stock || 0,
          sellPrice: p.sellPrice || 0,
          unit: p.unit || 'pcs',
          isActive: p.isActive ? 'Active' : 'Inactive',
        }));
      }
      // ── INVENTORY FORECASTING (computed from Product data) ────────
      if (delegate === this.prisma.product && moduleSlug === 'inventory-forecasting') {
        const products = await delegate.findMany({
          where: { companyId },
          select: { id: true, sku: true, name: true, category: true, stock: true, minStock: true, costPrice: true, sellPrice: true },
          orderBy: { name: 'asc' },
        });
        return products.map((p: any) => {
          const stock = p.stock || 0;
          const minStock = p.minStock || 0;
          // Simulate forecast data based on current stock
          const avgDemand = Math.max(1, Math.round(minStock * 0.3));
          const leadTimeDays = Math.max(1, Math.round(Math.random() * 10) + 3);
          const reorderPoint = Math.round(avgDemand * leadTimeDays);
          const suggestedOrder = stock <= reorderPoint ? Math.round(reorderPoint * 1.5 - stock) : 0;
          const daysUntilStockout = stock > 0 && avgDemand > 0 ? Math.round(stock / avgDemand) : 0;
          return {
            id: p.id,
            sku: p.sku,
            product: p.name,
            category: p.category || '',
            currentStock: stock,
            avgDemand,
            leadTimeDays,
            reorderPoint,
            suggestedOrder,
            daysUntilStockout,
            confidence: suggestedOrder > 0 ? 'Medium' : 'High',
          };
        });
      }
      // ── SUPPLIER STOCK (Products cross-referenced with Vendors) ───
      if (delegate === this.prisma.product && moduleSlug === 'supplier-stock') {
        // Get all vendors for this company
        const vendors = await this.prisma.vendor.findMany({
          where: { companyId },
          select: { id: true, name: true, email: true, phone: true },
        });
        const products = await delegate.findMany({
          where: { companyId },
          select: { id: true, sku: true, name: true, category: true, stock: true, costPrice: true, sellPrice: true },
          orderBy: { name: 'asc' },
        });
        // Cross-reference: assign each product to a vendor round-robin
        return products.map((p: any, idx: number) => {
          const vendor = vendors[idx % (vendors.length || 1)] || { name: 'Default Supplier' };
          return {
            id: p.id,
            product: p.name,
            sku: p.sku,
            category: p.category || '',
            supplier: vendor.name,
            supplierEmail: vendor.email || '',
            supplierPhone: vendor.phone || '',
            stockLevel: p.stock || 0,
            costPrice: p.costPrice,
            sellPrice: p.sellPrice,
            leadTime: Math.round(Math.random() * 10) + 5,
            lastOrdered: '',
            status: (p.stock || 0) <= 0 ? 'Out of Stock' : 'Available',
          };
        });
      }
      // ── WAREHOUSE ANALYTICS (computed from Products & Warehouses) ────
      if (delegate === this.prisma.product && moduleSlug === 'warehouse-analytics') {
        const products = await delegate.findMany({ where: { companyId }, select: { stock: true, costPrice: true, sellPrice: true, category: true } });
        const warehouses = await this.prisma.warehouse.findMany({ where: { companyId } });
        const totalProducts = products.length;
        const totalStock = products.reduce((s: number, p: any) => s + (p.stock || 0), 0);
        const stockValue = products.reduce((s: number, p: any) => s + ((p.stock || 0) * (p.costPrice || 0)), 0);
        const avgTurnover = totalProducts > 0 ? Math.round(totalStock / totalProducts) : 0;
        
        // Category breakdown
        const catBreakdown: Record<string, number> = {};
        products.forEach((p: any) => {
          const cat = p.category || 'Other';
          catBreakdown[cat] = (catBreakdown[cat] || 0) + (p.stock || 0);
        });

        return [
          { metric: 'Total Products', value: totalProducts.toString(), change: 'All time', trend: 'Stable' },
          { metric: 'Total Stock Units', value: totalStock.toLocaleString(), change: 'Across all warehouses', trend: 'Up' },
          { metric: 'Stock Value (Cost)', value: `ETB ${stockValue.toLocaleString()}`, change: 'Total cost basis', trend: 'Up' },
          { metric: 'Avg Turnover Rate', value: `${avgTurnover} units/product`, change: 'Monthly avg', trend: 'Stable' },
          { metric: 'Warehouses', value: warehouses.length.toString(), change: 'Active locations', trend: 'Stable' },
          { metric: 'Categories', value: Object.keys(catBreakdown).length.toString(), change: 'Product categories', trend: 'Stable' },
        ];
      }
      // ── BATCH & SERIAL NUMBERS ────────────────────────────────────
      if (delegate === this.prisma.productBatch) {
        const batches = await delegate.findMany({
          where: { companyId },
          include: {
            product: { select: { name: true, sku: true } },
            warehouse: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        });
        return batches.map((b: any) => ({
          id: b.id,
          batchNumber: b.batchNumber || '',
          serialNumber: b.serialNumber || '',
          product: b.product?.name || '',
          sku: b.product?.sku || '',
          quantity: b.quantity || 0,
          expiryDate: b.expiryDate ? b.expiryDate.toISOString().split('T')[0] : '',
          manufacturingDate: b.manufacturingDate ? b.manufacturingDate.toISOString().split('T')[0] : '',
          warehouse: b.warehouse?.name || '',
          status: b.status || 'ACTIVE',
          createdAt: b.createdAt ? b.createdAt.toISOString() : '',
        }));
      }
      // ── GOODS RECEIPT (Stock movements of type RECEIPT) ────────────
      if (delegate === this.prisma.stockMovement && moduleSlug === 'goods-receipt') {
        const movements = await delegate.findMany({
          where: { companyId, type: 'RECEIPT' },
          include: {
            product: { select: { name: true, sku: true } },
            warehouse: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        });
        return movements.map((m: any) => ({
          id: m.id,
          product: m.product?.name || '',
          sku: m.product?.sku || '',
          quantityChange: m.quantityChange || 0,
          type: m.type || 'RECEIPT',
          referenceNo: m.referenceNo || '',
          warehouse: m.warehouse?.name || '',
          balanceBefore: m.balanceBefore || 0,
          balanceAfter: m.balanceAfter || 0,
          notes: m.notes || '',
          createdAt: m.createdAt ? m.createdAt.toISOString() : '',
        }));
      }
      // ── STOCK TRANSFERS (Stock movements of type TRANSFER) ─────────
      if (delegate === this.prisma.stockMovement && moduleSlug === 'stock-transfers') {
        const movements = await delegate.findMany({
          where: { companyId, type: { in: ['TRANSFER_IN', 'TRANSFER_OUT'] } },
          include: {
            product: { select: { name: true, sku: true } },
            warehouse: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        });
        return movements.map((m: any) => ({
          id: m.id,
          product: m.product?.name || '',
          sku: m.product?.sku || '',
          quantityChange: m.quantityChange || 0,
          type: m.type || 'TRANSFER_OUT',
          referenceNo: m.referenceNo || '',
          warehouse: m.warehouse?.name || '',
          balanceBefore: m.balanceBefore || 0,
          balanceAfter: m.balanceAfter || 0,
          notes: m.notes || '',
          createdAt: m.createdAt ? m.createdAt.toISOString() : '',
        }));
      }
      // ── CYCLE COUNTS ───────────────────────────────────────────────
      if (delegate === this.prisma.cycleCount) {
        const counts = await delegate.findMany({
          where: { companyId },
          include: {
            product: { select: { name: true, sku: true } },
            warehouse: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        });
        return counts.map((c: any) => ({
          id: c.id,
          countNo: c.countNo || '',
          product: c.product?.name || '',
          sku: c.product?.sku || '',
          warehouse: c.warehouse?.name || '',
          expectedQuantity: c.expectedQuantity || 0,
          actualQuantity: c.actualQuantity || 0,
          variance: c.variance || 0,
          status: c.status || 'PENDING',
          countedBy: c.countedBy || '',
          countedAt: c.countedAt ? c.countedAt.toISOString().split('T')[0] : '',
          notes: c.notes || '',
          createdAt: c.createdAt ? c.createdAt.toISOString() : '',
        }));
      }
      // ── CUSTOMER MANAGEMENT (with deal & invoice counts) ──────────
      if (delegate === this.prisma.customer && moduleSlug === 'customer-management') {
        const customers = await delegate.findMany({
          where: { companyId },
          include: {
            _count: { select: { deals: true, invoices: true } },
          },
          orderBy: { name: 'asc' },
        });
        const TYPE_LABELS: Record<string, string> = { INDIVIDUAL: 'Individual', BUSINESS: 'Business' };
        const STATUS_LABELS: Record<string, string> = { ACTIVE: 'Active', INACTIVE: 'Inactive', PROSPECT: 'Prospect' };
        return customers.map((c: any) => ({
          id: c.id,
          name: c.name,
          email: c.email || '',
          phone: c.phone || '',
          company: c.company || '',
          type: TYPE_LABELS[c.type] || c.type,
          status: STATUS_LABELS[c.status] || c.status,
          notes: c.notes || '',
          source: c.source || '',
          dealsCount: c._count?.deals || 0,
          invoicesCount: c._count?.invoices || 0,
          createdAt: c.createdAt ? c.createdAt.toISOString() : '',
          updatedAt: c.updatedAt ? c.updatedAt.toISOString() : '',
        }));
      }
      if (delegate === this.prisma.customer && moduleSlug === 'contact-management') {
        return delegate.findMany({ where: { companyId }, select: { id: true, name: true, email: true, phone: true, company: true, type: true }, orderBy: { name: 'asc' } });
      }
      // ── DEAL (Opportunity Pipeline) with customer name ────────────
      if (delegate === this.prisma.deal) {
        const deals = await delegate.findMany({
          where: { companyId },
          include: { customer: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        });
        const STAGE_LABELS: Record<string, string> = {
          PROSPECTING: 'Prospecting', QUALIFICATION: 'Qualification',
          PROPOSAL: 'Proposal', NEGOTIATION: 'Negotiation',
          CLOSED_WON: 'Closed Won', CLOSED_LOST: 'Lost',
        };
        return deals.map((d: any) => ({
          id: d.id,
          title: d.title,
          value: d.value || 0,
          stage: STAGE_LABELS[d.stage] || d.stage,
          closeDate: d.closeDate ? d.closeDate.toISOString().split('T')[0] : '',
          probability: d.probability || 0,
          notes: d.notes || '',
          customer: d.customer?.name || '',
          customerId: d.customerId || '',
          createdAt: d.createdAt ? d.createdAt.toISOString() : '',
          updatedAt: d.updatedAt ? d.updatedAt.toISOString() : '',
        }));
      }
      // ── INVOICE with customer name ────────────────────────────────
      if (delegate === this.prisma.invoice && !(pillarSlug === 'finance-accounting' && (moduleSlug === 'accounts-payable' || moduleSlug === 'accounts-receivable'))) {
        const invoices = await delegate.findMany({
          where: { companyId },
          include: {
            customer: { select: { name: true } },
            deal: { select: { id: true, title: true } },
            items: { select: { id: true, description: true, quantity: true, unitPrice: true, total: true } },
          },
          orderBy: { createdAt: 'desc' },
        });
        const STATUS_LABELS: Record<string, string> = { DRAFT: 'Draft', SENT: 'Sent', PAID: 'Paid', OVERDUE: 'Overdue', CANCELLED: 'Cancelled' };
        return invoices.map((inv: any) => ({
          id: inv.id,
          invoiceNo: inv.invoiceNo,
          customer: inv.customer?.name || '',
          customerId: inv.customerId || '',
          deal: inv.deal?.title || '',
          dealId: inv.dealId || '',
          date: inv.issueDate ? inv.issueDate.toISOString().split('T')[0] : '',
          dueDate: inv.dueDate ? inv.dueDate.toISOString().split('T')[0] : '',
          amount: inv.total || 0,
          subTotal: inv.subTotal || 0,
          taxAmount: inv.taxAmount || 0,
          total: inv.total || 0,
          paid: inv.status === 'PAID' ? inv.total : 0,
          status: STATUS_LABELS[inv.status] || inv.status,
          notes: inv.notes || '',
          items: inv.items || [],
          createdAt: inv.createdAt ? inv.createdAt.toISOString() : '',
          updatedAt: inv.updatedAt ? inv.updatedAt.toISOString() : '',
        }));
      }
      // ── CONTRACTS with vendor name ──────────────────────────────────
      if (delegate === this.prisma.contract) {
        const contracts = await delegate.findMany({
          where: { companyId },
          include: { vendor: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        });
        const STATUS_LABELS: Record<string, string> = { DRAFT: 'Draft', ACTIVE: 'Active', EXPIRED: 'Expired', TERMINATED: 'Terminated' };
        return contracts.map((c: any) => ({
          id: c.id,
          title: c.title,
          value: c.value || 0,
          startDate: c.startDate ? c.startDate.toISOString().split('T')[0] : '',
          endDate: c.endDate ? c.endDate.toISOString().split('T')[0] : '',
          status: STATUS_LABELS[c.status] || c.status,
          fileUrl: c.fileUrl || '',
          vendor: c.vendor?.name || '',
          vendorId: c.vendorId || '',
          createdAt: c.createdAt ? c.createdAt.toISOString() : '',
        }));
      }

      // ── WAREHOUSES (map isActive boolean to display string) ─────
      if (delegate === this.prisma.warehouse) {
        const records = await delegate.findMany({
          where: { companyId },
          select: { id: true, name: true, code: true, location: true, capacity: true, managerName: true, phone: true, email: true, isActive: true },
          orderBy: { name: 'asc' },
        });
        return records.map((w: any) => ({
          id: w.id,
          name: w.name,
          code: w.code || '',
          location: w.location || '',
          capacity: w.capacity || 0,
          managerName: w.managerName || '',
          phone: w.phone || '',
          email: w.email || '',
          isActive: w.isActive ? 'Active' : 'Inactive',
        }));
      }

      // ── FINANCE & ACCOUNTING: Specialized computed handlers ───────────
      if (pillarSlug === 'finance-accounting') {
        // ── GENERAL LEDGER: Journal entries from invoices + expenses ──
        if (moduleSlug === 'general-ledger') {
          const [invoices, expenses, budgets, manualEntries] = await Promise.all([
            this.prisma.invoice.findMany({
              where: { companyId },
              include: { customer: { select: { name: true } }, items: { select: { description: true, quantity: true, unitPrice: true, total: true } } },
              orderBy: { createdAt: 'desc' },
            }),
            this.prisma.expense.findMany({ where: { companyId }, orderBy: { date: 'desc' } }),
            this.prisma.budget.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' } }),
            this.prisma.journalEntry.findMany({ where: { companyId }, orderBy: { date: 'desc' } }),
          ]);
          const entries: any[] = [];
          // Invoice journal entries
          invoices.forEach((inv: any) => {
            const date = inv.issueDate?.toISOString().split('T')[0] || '';
            entries.push({ date, ref: `INV-${inv.invoiceNo}`, account: '1100 - Accounts Receivable', description: `Invoice ${inv.invoiceNo} - ${inv.customer?.name || ''}`, debit: inv.total || 0, credit: 0, status: inv.status === 'PAID' ? 'Posted' : 'Draft' });
            entries.push({ date, ref: `INV-${inv.invoiceNo}`, account: '4100 - Sales Revenue', description: `Revenue ${inv.invoiceNo}`, debit: 0, credit: inv.total || 0, status: inv.status === 'PAID' ? 'Posted' : 'Draft' });
          });
          // Expense journal entries
          expenses.forEach((exp: any) => {
            const date = exp.date?.toISOString().split('T')[0] || '';
            entries.push({ date, ref: `EXP-${exp.id?.slice(0,8)}`, account: '6100 - Operating Expenses', description: exp.title || 'Expense', debit: exp.amount || 0, credit: 0, status: exp.status === 'APPROVED' ? 'Posted' : 'Draft' });
            entries.push({ date, ref: `EXP-${exp.id?.slice(0,8)}`, account: '1100 - Cash/Bank', description: `Payment: ${exp.title || ''}`, debit: 0, credit: exp.amount || 0, status: exp.status === 'APPROVED' ? 'Posted' : 'Draft' });
          });
          // Budget allocations
          budgets.forEach((bud: any) => {
            const date = bud.createdAt?.toISOString().split('T')[0] || '';
            entries.push({ date, ref: `BDG-${bud.id?.slice(0,8)}`, account: '7000 - Budget Allocation', description: `${bud.name} - ${bud.department || ''}`.trim(), debit: bud.amount || 0, credit: 0, status: 'Posted' });
          });
          // Manual journal entries
          manualEntries.forEach((entry: any) => {
            const date = entry.date?.toISOString().split('T')[0] || '';
            entries.push({ 
              id: entry.id, // Include id so edit/delete works on manual entries
              date, 
              ref: entry.ref || '', 
              account: entry.account || '', 
              description: entry.description || '', 
              debit: entry.debit || 0, 
              credit: entry.credit || 0, 
              status: entry.status || 'Posted' 
            });
          });
          return entries.sort((a: any, b: any) => b.date.localeCompare(a.date));
        }

        // ── ACCOUNTS PAYABLE: Unpaid bills (SENT/OVERDUE invoices we owe) ──
        if (moduleSlug === 'accounts-payable') {
          const invoices = await this.prisma.invoice.findMany({
            where: { companyId, status: { in: ['SENT', 'OVERDUE'] } },
            include: { customer: { select: { name: true } } },
            orderBy: { dueDate: 'asc' },
          });
          const STATUS_LABELS: Record<string, string> = { SENT: 'Pending', OVERDUE: 'Overdue', DRAFT: 'Draft', PAID: 'Paid', CANCELLED: 'Cancelled' };
          return invoices.map((inv: any) => ({
            id: inv.id,
            vendor: inv.customer?.name || 'Unknown Vendor',
            invoiceNo: inv.invoiceNo,
            invoiceDate: inv.issueDate?.toISOString().split('T')[0] || '',
            dueDate: inv.dueDate?.toISOString().split('T')[0] || '',
            amount: inv.total || 0,
            paid: 0,
            balance: inv.total || 0,
            status: STATUS_LABELS[inv.status] || inv.status,
            daysOverdue: inv.dueDate ? Math.max(0, Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / (1000*60*60*24))) : 0,
          }));
        }

        // ── ACCOUNTS RECEIVABLE: Money owed to us (SENT/OVERDUE invoices) ──
        if (moduleSlug === 'accounts-receivable') {
          const invoices = await this.prisma.invoice.findMany({
            where: { companyId, status: { in: ['SENT', 'OVERDUE'] } },
            include: { customer: { select: { name: true } } },
            orderBy: { dueDate: 'asc' },
          });
          const STATUS_LABELS: Record<string, string> = { SENT: 'Outstanding', OVERDUE: 'Overdue', DRAFT: 'Draft', PAID: 'Paid', CANCELLED: 'Cancelled' };
          return invoices.map((inv: any) => ({
            id: inv.id,
            customer: inv.customer?.name || 'Unknown Customer',
            invoiceNo: inv.invoiceNo,
            issueDate: inv.issueDate?.toISOString().split('T')[0] || '',
            dueDate: inv.dueDate?.toISOString().split('T')[0] || '',
            amount: inv.total || 0,
            paid: 0,
            balance: inv.total || 0,
            status: STATUS_LABELS[inv.status] || inv.status,
            daysOverdue: inv.dueDate ? Math.max(0, Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / (1000*60*60*24))) : 0,
            aging: inv.dueDate ? (() => {
              const days = Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / (1000*60*60*24));
              if (days <= 0) return 'Current';
              if (days <= 30) return '1-30 Days';
              if (days <= 60) return '31-60 Days';
              if (days <= 90) return '61-90 Days';
              return '90+ Days';
            })() : 'Current',
          }));
        }

        // ── BUDGETING: Compute status from amount vs spent ──
        if (moduleSlug === 'budgeting') {
          const budgets = await this.prisma.budget.findMany({
            where: { companyId },
            orderBy: [{ year: 'desc' }, { month: 'desc' }],
          });
          const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
          return budgets.map((b: any) => {
            const amount = b.amount || 0;
            const spent = b.spent || 0;
            let status: string;
            if (spent <= 0) {
              status = 'Draft';
            } else if (spent < amount) {
              status = 'Under Budget';
            } else if (spent === amount) {
              status = 'On Track';
            } else {
              status = 'Over Budget';
            }
            return {
              id: b.id,
              name: b.name || '',
              department: b.department || '',
              year: b.year || new Date().getFullYear(),
              month: b.month || 1,
              monthName: b.month ? MONTH_NAMES[b.month - 1] || '' : '',
              amount,
              spent,
              status,
              createdAt: b.createdAt ? b.createdAt.toISOString() : '',
              updatedAt: b.updatedAt ? b.updatedAt.toISOString() : '',
            };
          });
        }

        // ── FIXED ASSETS: Format dates for frontend display ──
        if (moduleSlug === 'fixed-assets') {
          const assets = await this.prisma.fixedAsset.findMany({
            where: { companyId },
            orderBy: { name: 'asc' },
          });
          return assets.map((a: any) => ({
            id: a.id,
            name: a.name || '',
            category: a.category || '',
            purchaseDate: a.purchaseDate ? a.purchaseDate.toISOString().split('T')[0] : '',
            purchaseValue: a.purchaseValue || 0,
            currentValue: a.currentValue || 0,
            depreciationRate: a.depreciationRate || 0,
            location: a.location || '',
          }));
        }

        // ── BANKING: Bank transactions from invoices + expenses ──
        if (moduleSlug === 'banking') {
          const [invoices, expenses] = await Promise.all([
            this.prisma.invoice.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' } }),
            this.prisma.expense.findMany({ where: { companyId }, orderBy: { date: 'desc' } }),
          ]);
          const transactions: any[] = [
            // Opening balance entry
            { date: '2025-01-01', ref: 'BAL-OPEN', description: 'Opening Balance', account: 'Operating Account', debit: 5000000, credit: 0, balance: 5000000, type: 'Opening Balance', status: 'Cleared' },
          ];
          let runningBalance = 5000000;
          // Add paid invoices as deposits
          invoices.filter((i: any) => i.status === 'PAID').forEach((inv: any) => {
            const date = inv.createdAt?.toISOString().split('T')[0] || '';
            runningBalance += (inv.total || 0);
            transactions.push({ date, ref: inv.invoiceNo, description: `Payment received: ${inv.customer?.name || ''}`, account: 'Operating Account', debit: inv.total || 0, credit: 0, balance: runningBalance, type: 'Deposit', status: 'Cleared' });
          });
          // Add approved expenses as withdrawals
          expenses.filter((e: any) => e.status === 'APPROVED').forEach((exp: any) => {
            const date = exp.date?.toISOString().split('T')[0] || '';
            runningBalance -= (exp.amount || 0);
            transactions.push({ date, ref: `EXP-${exp.id?.slice(0,8)}`, description: `Payment: ${exp.title || ''}`, account: 'Operating Account', debit: 0, credit: exp.amount || 0, balance: runningBalance, type: 'Withdrawal', status: 'Cleared' });
          });
          return transactions.sort((a: any, b: any) => b.date.localeCompare(a.date) || b.date.localeCompare(a.date));
        }

        // ── CASH FLOW: Computed cash inflows/outflows ──
        if (moduleSlug === 'cash-flow') {
          const [invoices, expenses] = await Promise.all([
            this.prisma.invoice.findMany({ where: { companyId }, orderBy: { issueDate: 'asc' } }),
            this.prisma.expense.findMany({ where: { companyId }, orderBy: { date: 'asc' } }),
          ]);
          // Group by month
          const monthlyMap: Record<string, { revenue: number; expenses: number; count: number }> = {};
          invoices.forEach((inv: any) => {
            if (inv.status !== 'PAID') return;
            const d = inv.issueDate || inv.createdAt;
            if (!d) return;
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyMap[key]) monthlyMap[key] = { revenue: 0, expenses: 0, count: 0 };
            monthlyMap[key].revenue += inv.total || 0;
            monthlyMap[key].count++;
          });
          expenses.forEach((exp: any) => {
            if (exp.status !== 'APPROVED') return;
            const d = exp.date || exp.createdAt;
            if (!d) return;
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyMap[key]) monthlyMap[key] = { revenue: 0, expenses: 0, count: 0 };
            monthlyMap[key].expenses += exp.amount || 0;
          });
          return Object.entries(monthlyMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([period, data]) => ({
              period,
              inflow: data.revenue,
              outflow: data.expenses,
              net: data.revenue - data.expenses,
              count: data.count,
              trend: data.revenue > data.expenses ? 'Positive' : 'Negative',
            }));
        }

        // ── TAX & VAT: Tax from invoices + expenses ──
        if (moduleSlug === 'tax-vat') {
          const records = await this.prisma.vatEntry.findMany({
            where: { companyId },
            orderBy: { date: 'desc' },
          });
          return records.map((r: any) => ({
            id: r.id,
            date: r.date ? r.date.toISOString().split('T')[0] : '',
            ref: r.ref || '',
            description: r.description || '',
            taxableAmount: r.taxableAmount || 0,
            vatAmount: r.vatAmount || 0,
            type: r.type || 'Output VAT (Sales)',
            status: r.status || 'Pending',
          }));
        }

        // ── MULTI-CURRENCY: Currency exchange rate data ──
    
    // Procurement handlers moved to generateDemoData
    if (moduleSlug === 'multi-currency') {
          const invoices = await this.prisma.invoice.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
            take: 20,
          });
          // Simulated rates
          const rates = [
            { currency: 'USD', rate: 57.25, change: '+0.35', lastUpdated: new Date().toISOString().split('T')[0] },
            { currency: 'EUR', rate: 62.80, change: '-0.15', lastUpdated: new Date().toISOString().split('T')[0] },
            { currency: 'GBP', rate: 72.40, change: '+0.50', lastUpdated: new Date().toISOString().split('T')[0] },
            { currency: 'KES', rate: 0.44, change: '-0.01', lastUpdated: new Date().toISOString().split('T')[0] },
            { currency: 'UGX', rate: 0.015, change: '0.00', lastUpdated: new Date().toISOString().split('T')[0] },
            { currency: 'TZS', rate: 0.022, change: '0.00', lastUpdated: new Date().toISOString().split('T')[0] },
            { currency: 'RWF', rate: 0.050, change: '+0.001', lastUpdated: new Date().toISOString().split('T')[0] },
            { currency: 'AED', rate: 15.60, change: '+0.10', lastUpdated: new Date().toISOString().split('T')[0] },
            { currency: 'CNY', rate: 7.90, change: '-0.05', lastUpdated: new Date().toISOString().split('T')[0] },
            { currency: 'SAR', rate: 15.25, change: '+0.08', lastUpdated: new Date().toISOString().split('T')[0] },
          ];
          return rates;
        }

        // ── AUDIT TRAIL: Log of changes ──
        if (moduleSlug === 'audit-trail') {
          const [invoices, expenses, budgets] = await Promise.all([
            this.prisma.invoice.findMany({ where: { companyId }, orderBy: { updatedAt: 'desc' }, take: 30 }),
            this.prisma.expense.findMany({ where: { companyId }, orderBy: { updatedAt: 'desc' }, take: 30 }),
            this.prisma.budget.findMany({ where: { companyId }, orderBy: { updatedAt: 'desc' }, take: 10 }),
          ]);
          const logs: any[] = [];
          invoices.forEach((inv: any) => {
            logs.push({ timestamp: inv.updatedAt?.toISOString() || inv.createdAt?.toISOString() || '', user: 'System', action: inv.status === 'PAID' ? 'Invoice Paid' : inv.status === 'SENT' ? 'Invoice Sent' : 'Invoice Updated', module: 'Invoicing', recordId: inv.id, details: `${inv.invoiceNo} - Status: ${inv.status}` });
          });
          expenses.forEach((exp: any) => {
            logs.push({ timestamp: exp.updatedAt?.toISOString() || exp.createdAt?.toISOString() || '', user: 'System', action: exp.status === 'APPROVED' ? 'Expense Approved' : 'Expense Updated', module: 'Expenses', recordId: exp.id, details: `${exp.title || ''} - ETB ${exp.amount || 0}` });
          });
          budgets.forEach((bud: any) => {
            logs.push({ timestamp: bud.updatedAt?.toISOString() || bud.createdAt?.toISOString() || '', user: 'System', action: 'Budget Updated', module: 'Budgeting', recordId: bud.id, details: `${bud.name || ''} - ETB ${bud.amount || 0}` });
          });
          return logs.sort((a: any, b: any) => b.timestamp.localeCompare(a.timestamp)).slice(0, 50);
        }

        // ── FINANCIAL STATEMENTS: P&L and Balance Sheet ──
        if (moduleSlug === 'financial-statements') {
          const [invoices, expenses, budgets, fixedAssets] = await Promise.all([
            this.prisma.invoice.findMany({ where: { companyId } }),
            this.prisma.expense.findMany({ where: { companyId } }),
            this.prisma.budget.findMany({ where: { companyId } }),
            this.prisma.fixedAsset.findMany({ where: { companyId } }),
          ]);
          const totalRevenue = invoices.filter((i: any) => i.status === 'PAID').reduce((s: number, i: any) => s + (i.total || 0), 0);
          const totalOutstanding = invoices.filter((i: any) => i.status === 'SENT' || i.status === 'OVERDUE').reduce((s: number, i: any) => s + (i.total || 0), 0);
          const totalExpenses = expenses.filter((e: any) => e.status === 'APPROVED').reduce((s: number, e: any) => s + (e.amount || 0), 0);
          const totalBudgeted = budgets.reduce((s: number, b: any) => s + (b.amount || 0), 0);
          const totalSpent = budgets.reduce((s: number, b: any) => s + (b.spent || 0), 0);
          const totalAssetValue = fixedAssets.reduce((s: number, a: any) => s + (a.currentValue || 0), 0);
          const netProfit = totalRevenue - totalExpenses;

          return [
            { section: 'Income', account: 'Total Revenue', amount: totalRevenue, status: 'Actual' },
            { section: 'Income', account: 'Outstanding Receivables', amount: totalOutstanding, status: 'Pending' },
            { section: 'Income', account: 'Gross Income', amount: totalRevenue, status: 'Actual' },
            { section: 'Expenses', account: 'Total Operating Expenses', amount: totalExpenses, status: 'Actual' },
            { section: 'Expenses', account: 'Budget Variance', amount: totalBudgeted - totalSpent, status: totalBudgeted - totalSpent >= 0 ? 'Under Budget' : 'Over Budget' },
            { section: 'Net Profit', account: 'Net Profit / Loss', amount: netProfit, status: netProfit >= 0 ? 'Profitable' : 'Loss' },
            { section: 'Balance Sheet', account: 'Fixed Assets (Net Book Value)', amount: totalAssetValue, status: 'Active' },
            { section: 'Balance Sheet', account: 'Budget Allocated', amount: totalBudgeted, status: 'Planned' },
            { section: 'Balance Sheet', account: 'Budget Utilized', amount: totalSpent, status: 'Actual' },
          ];
        }

        // ── FINANCIAL ANALYTICS: KPIs and trends ──
        if (moduleSlug === 'financial-analytics') {
          const [invoices, expenses, fixedAssets, budgets] = await Promise.all([
            this.prisma.invoice.findMany({ where: { companyId } }),
            this.prisma.expense.findMany({ where: { companyId } }),
            this.prisma.fixedAsset.findMany({ where: { companyId } }),
            this.prisma.budget.findMany({ where: { companyId } }),
          ]);
          const totalRevenue = invoices.filter((i: any) => i.status === 'PAID').reduce((s: number, i: any) => s + (i.total || 0), 0);
          const totalOutstanding = invoices.filter((i: any) => i.status === 'SENT' || i.status === 'OVERDUE').reduce((s: number, i: any) => s + (i.total || 0), 0);
          const totalExpenses = expenses.filter((e: any) => e.status === 'APPROVED').reduce((s: number, e: any) => s + (e.amount || 0), 0);
          const totalInvoices = invoices.length;
          const paidInvoices = invoices.filter((i: any) => i.status === 'PAID').length;
          const overdueInvoices = invoices.filter((i: any) => i.status === 'OVERDUE').length;
          const totalAssetValue = fixedAssets.reduce((s: number, a: any) => s + (a.currentValue || 0), 0);
          const totalBudgetAmount = budgets.reduce((s: number, b: any) => s + (b.amount || 0), 0);
          const totalBudgetSpent = budgets.reduce((s: number, b: any) => s + (b.spent || 0), 0);
          const netProfit = totalRevenue - totalExpenses;
          const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 10000) / 100 : 0;
          const collectionRate = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 10000) / 100 : 0;

          return [
            { metric: 'Total Revenue', value: `ETB ${totalRevenue.toLocaleString()}`, target: `ETB ${(totalRevenue * 1.2).toLocaleString()}`, achieved: totalRevenue > 0 ? Math.round((totalRevenue / (totalRevenue * 1.2)) * 100) : 0, trend: 'Up', bestPractice: 'Revenue growth drives business expansion' },
            { metric: 'Net Profit', value: `ETB ${netProfit.toLocaleString()}`, target: `ETB ${(totalRevenue * 0.15).toLocaleString()}`, achieved: netProfit > 0 ? Math.round((netProfit / (totalRevenue * 0.15)) * 100) : 0, trend: netProfit >= 0 ? 'Up' : 'Down', bestPractice: 'Target net profit margin of 15%+' },
            { metric: 'Profit Margin', value: `${profitMargin}%`, target: '15%', achieved: profitMargin, trend: profitMargin >= 15 ? 'Up' : 'Down', bestPractice: 'Industry benchmark: 10-20% net profit margin' },
            { metric: 'Total Expenses', value: `ETB ${totalExpenses.toLocaleString()}`, target: `ETB ${(totalRevenue * 0.85).toLocaleString()}`, achieved: totalRevenue > 0 ? Math.round((totalExpenses / totalRevenue) * 100) : 0, trend: totalExpenses <= totalRevenue ? 'Stable' : 'Down', bestPractice: 'Keep expenses below 85% of revenue' },
            { metric: 'Outstanding AR', value: `ETB ${totalOutstanding.toLocaleString()}`, target: 'ETB 0', achieved: totalOutstanding > 0 ? 50 : 100, trend: totalOutstanding > 0 ? 'Stable' : 'Up', bestPractice: 'Follow up on overdue invoices within 30 days' },
            { metric: 'Collection Rate', value: `${collectionRate}%`, target: '95%', achieved: collectionRate, trend: collectionRate >= 80 ? 'Up' : 'Down', bestPractice: 'Target collection rate of 95%+ for healthy cash flow' },
            { metric: 'Overdue Ratio', value: `${totalInvoices > 0 ? Math.round((overdueInvoices / totalInvoices) * 100) : 0}%`, target: '<5%', achieved: totalInvoices > 0 ? Math.max(0, 100 - Math.round((overdueInvoices / totalInvoices) * 100)) : 100, trend: overdueInvoices === 0 ? 'Up' : 'Down', bestPractice: 'Keep overdue invoices under 5% of total' },
            { metric: 'Asset Value', value: `ETB ${totalAssetValue.toLocaleString()}`, target: `ETB ${(totalAssetValue * 1.1).toLocaleString()}`, achieved: totalAssetValue > 0 ? 80 : 0, trend: 'Stable', bestPractice: 'Track depreciation regularly for accurate valuation' },
            { metric: 'Budget Utilization', value: `${totalBudgetAmount > 0 ? Math.round((totalBudgetSpent / totalBudgetAmount) * 100) : 0}%`, target: '85%', achieved: totalBudgetAmount > 0 ? Math.round((totalBudgetSpent / totalBudgetAmount) * 100) : 0, trend: totalBudgetSpent <= totalBudgetAmount ? 'Stable' : 'Down', bestPractice: 'Maintain budget utilization between 70-90%' },
            { metric: 'Invoice Count', value: totalInvoices.toString(), target: (totalInvoices * 1.3).toFixed(0), achieved: totalInvoices > 0 ? 70 : 0, trend: 'Stable', bestPractice: 'Increase invoice volume by 30% quarter-over-quarter' },
          ];
        }
      }

      if (delegate === this.prisma.expense) {
        return delegate.findMany({ where: { companyId }, orderBy: { date: 'desc' } });
      }

      // ── PROCUREMENT: Computed analytics & formatted data ─────────────
      if (pillarSlug === 'procurement') {
        // Purchase Requests
        if (moduleSlug === 'purchase-requests') {
          const records = await this.prisma.purchase.findMany({
            where: { companyId },
            include: { items: { select: { quantity: true, unitCost: true, total: true, product: { select: { name: true } } } } },
            orderBy: { createdAt: 'desc' },
          });
          const PRIORITY_MAP = ['Low', 'Medium', 'High'];
          return records.map((p: any, idx: number) => ({
            id: p.id,
            reqNo: p.purchaseNo || '',
            requester: p.supplierName || '',
            item: p.items?.[0]?.product?.name || p.items?.[0]?.description || p.notes || 'Various Items',
            qty: p.items?.reduce((s: number, i: any) => s + (i.quantity || 0), 0) || 1,
            estCost: p.total || 0,
            priority: PRIORITY_MAP[idx % 3],
            status: p.status === 'PENDING' ? 'Pending' : p.status === 'ORDERED' ? 'Approved' : p.status === 'RECEIVED' ? 'Approved' : p.status === 'CANCELLED' ? 'Cancelled' : 'Pending',
          }));
        }
        // RFQs
        if (moduleSlug === 'rfqs') {
          const records = await this.prisma.rfq.findMany({
            where: { companyId },
            include: { vendor: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
          });
          return records.map((r: any) => ({
            id: r.id,
            rfqNo: r.rfqNo || '',
            title: r.title || '',
            vendor: r.vendor?.name || '',
            dueDate: r.dueDate ? r.dueDate.toISOString().split('T')[0] : '',
            total: r.total || 0,
            status: r.status || 'Draft',
          }));
        }
        // Vendor Management
        if (moduleSlug === 'vendor-management') {
          const records = await this.prisma.vendor.findMany({
            where: { companyId },
            orderBy: { name: 'asc' },
          });
          return records.map((v: any) => ({
            id: v.id,
            name: v.name || '',
            email: v.email || '',
            phone: v.phone || '',
            category: v.category || '',
            rating: v.rating || 0,
            status: v.isActive ? 'Active' : 'Inactive',
          }));
        }
        // Supplier Portal (same as vendor but different title)
        if (moduleSlug === 'supplier-portal') {
          const records = await this.prisma.vendor.findMany({
            where: { companyId, isActive: true },
            orderBy: { name: 'asc' },
          });
          return records.map((v: any) => ({
            id: v.id,
            name: v.name || '',
            email: v.email || '',
            phone: v.phone || '',
            category: v.category || '',
            rating: v.rating || 0,
            status: v.isActive ? 'Active' : 'Inactive',
          }));
        }
        // Contract Management
        if (moduleSlug === 'contract-management') {
          const records = await this.prisma.contract.findMany({
            where: { companyId },
            include: { vendor: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
          });
          const STATUS_LABELS: Record<string, string> = { DRAFT: 'Draft', ACTIVE: 'Active', EXPIRED: 'Expired', TERMINATED: 'Terminated' };
          return records.map((c: any) => ({
            id: c.id,
            title: c.title || '',
            vendor: c.vendor?.name || '',
            value: c.value || 0,
            startDate: c.startDate ? c.startDate.toISOString().split('T')[0] : '',
            endDate: c.endDate ? c.endDate.toISOString().split('T')[0] : '',
            status: STATUS_LABELS[c.status] || c.status,
          }));
        }
        // Approval Workflow
        if (moduleSlug === 'approval-workflow') {
          const records = await this.prisma.approvalWorkflow.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
          });
          return records.map((a: any) => ({
            id: a.id,
            requestNo: a.requestNo || '',
            module: a.module || '',
            requestedBy: a.requestedBy || '',
            approver: a.approver || '',
            status: a.status || 'Pending',
            createdAt: a.createdAt ? a.createdAt.toISOString().split('T')[0] : '',
          }));
        }
        // Tender Management
        if (moduleSlug === 'tender-management') {
          const records = await this.prisma.tender.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
          });
          return records.map((t: any) => ({
            id: t.id,
            tenderNo: t.tenderNo || '',
            title: t.title || '',
            department: t.department || '',
            issueDate: t.issueDate ? t.issueDate.toISOString().split('T')[0] : '',
            closingDate: t.closingDate ? t.closingDate.toISOString().split('T')[0] : '',
            budget: t.budget || 0,
            status: t.status || 'Open',
          }));
        }
        // Procurement Analytics
        if (moduleSlug === 'procurement-analytics') {
          const [vendors, contracts, rfqs, tenders] = await Promise.all([
            this.prisma.vendor.findMany({ where: { companyId } }),
            this.prisma.contract.findMany({ where: { companyId } }),
            this.prisma.rfq.findMany({ where: { companyId } }),
            this.prisma.tender.findMany({ where: { companyId } }),
          ]);
          const activeContracts = contracts.filter((c: any) => c.status === 'ACTIVE').length;
          const openRfqs = rfqs.filter((r: any) => r.status === 'Sent' || r.status === 'Draft').length;
          const avgRating = vendors.length > 0 ? vendors.reduce((s: number, v: any) => s + (v.rating || 0), 0) / vendors.length : 0;
          const totalBudget = tenders.reduce((s: number, t: any) => s + (t.budget || 0), 0);
          return [
            { metric: 'Total Vendors', value: vendors.length.toString(), target: '30', achieved: Math.round((vendors.length / 30) * 100), trend: 'Up' },
            { metric: 'Active Contracts', value: activeContracts.toString(), target: '20', achieved: Math.round((activeContracts / 20) * 100), trend: 'Stable' },
            { metric: 'Open RFQs', value: openRfqs.toString(), target: '8', achieved: Math.round((openRfqs / 8) * 100), trend: openRfqs > 0 ? 'Stable' : 'Down' },
            { metric: 'Avg Vendor Rating', value: avgRating.toFixed(1) + '/5', target: '4.5/5', achieved: Math.round((avgRating / 5) * 100), trend: avgRating >= 4 ? 'Up' : 'Stable' },
            { metric: 'Total Tender Budget', value: 'ETB ' + totalBudget.toLocaleString(), target: 'ETB ' + (totalBudget * 1.2).toLocaleString(), achieved: 80, trend: 'Stable' },
          ];
        }
      }


      // ══════════════════════════════════════════════════════════════════
      // MANUFACTURING: Handlers for all 8 modules
      // ══════════════════════════════════════════════════════════════════
      if (pillarSlug === 'manufacturing') {
        // Work Orders (also used by production-planning)
        if (moduleSlug === 'work-orders' || moduleSlug === 'production-planning') {
          const records = await this.prisma.workOrder.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
          });
          // Resolve product names
          const productIds = [...new Set(records.map((w: any) => w.productId).filter(Boolean))];
          const products = productIds.length > 0 ? await this.prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true } }) : [];
          const productMap = new Map(products.map((p: any) => [p.id, p.name]));
          const STATUS_MAP: Record<string, string> = { PLANNED: 'Planned', IN_PRODUCTION: 'In Production', QUALITY_CHECK: 'Quality Check', COMPLETED: 'Completed', CANCELLED: 'Cancelled' };
          return records.map((w: any) => ({
            id: w.id,
            orderNumber: w.orderNumber || '',
            product: productMap.get(w.productId) || w.productId || '',
            quantity: w.quantity || 0,
            planNo: w.orderNumber || '',
            qty: w.quantity || 0,
            startDate: w.startDate ? w.startDate.toISOString().split('T')[0] : '',
            endDate: w.endDate ? w.endDate.toISOString().split('T')[0] : '',
            status: STATUS_MAP[w.status] || w.status,
          }));
        }
        // Machine Monitoring
        if (moduleSlug === 'machine-monitoring') {
          const records = await this.prisma.machine.findMany({ where: { companyId }, orderBy: { name: 'asc' } });
          return records.map((m: any) => ({ id: m.id, machineNo: m.machineNo || '', name: m.name || '', model: m.model || '', utilization: m.utilization || 0, location: m.location || '', status: m.status === 'OPERATIONAL' ? 'Operational' : m.status === 'IDLE' ? 'Idle' : m.status === 'MAINTENANCE' ? 'Maintenance' : 'Offline' }));
        }
        // Maintenance
        if (moduleSlug === 'maintenance') {
          const records = await this.prisma.maintenanceRecord.findMany({ where: { companyId }, include: { machine: { select: { name: true } } }, orderBy: { createdAt: 'desc' } });
          return records.map((r: any) => ({ id: r.id, recordNo: r.recordNo || '', machine: r.machine?.name || '', title: r.title || '', type: r.type === 'PREVENTIVE' ? 'Preventive' : r.type === 'CORRECTIVE' ? 'Corrective' : r.type === 'EMERGENCY' ? 'Emergency' : 'Scheduled', scheduledDate: r.scheduledDate ? r.scheduledDate.toISOString().split('T')[0] : '', cost: r.cost || 0, status: r.status === 'PLANNED' ? 'Planned' : r.status === 'IN_PROGRESS' ? 'In Progress' : r.status === 'COMPLETED' ? 'Completed' : 'Cancelled' }));
        }
        // Quality Control
        if (moduleSlug === 'quality-control') {
          const records = await this.prisma.qualityCheck.findMany({ where: { companyId }, orderBy: { checkedAt: 'desc' } });
          // Resolve product names
          const productIds = [...new Set(records.map((q: any) => q.productId).filter(Boolean))];
          const products = productIds.length > 0 ? await this.prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true } }) : [];
          const productMap = new Map(products.map((p: any) => [p.id, p.name]));
          return records.map((q: any) => ({ id: q.id, checkNo: q.checkNo || '', product: productMap.get(q.productId) || q.productId || '', inspector: q.inspector || '', result: q.result === 'PASS' ? 'Pass' : q.result === 'FAIL' ? 'Fail' : q.result === 'REWORK' ? 'Rework' : 'Pending', notes: q.notes || '', checkedAt: q.checkedAt ? q.checkedAt.toISOString().split('T')[0] : '' }));
        }
        // Production Scheduling
        if (moduleSlug === 'production-scheduling') {
          const records = await this.prisma.productionSchedule.findMany({ where: { companyId }, include: { machine: { select: { name: true } } }, orderBy: { createdAt: 'desc' } });
          // Resolve work order numbers
          const workOrderIds = [...new Set(records.map((s: any) => s.workOrderId).filter(Boolean))];
          const workOrders = workOrderIds.length > 0 ? await this.prisma.workOrder.findMany({ where: { id: { in: workOrderIds } }, select: { id: true, orderNumber: true } }) : [];
          const woMap = new Map(workOrders.map((wo: any) => [wo.id, wo.orderNumber]));
          return records.map((s: any) => ({ id: s.id, scheduleNo: s.scheduleNo || '', workOrder: woMap.get(s.workOrderId) || s.workOrderId || '', machine: s.machine?.name || '', priority: s.priority || 'Medium', startDate: s.startDate ? s.startDate.toISOString().split('T')[0] : '', endDate: s.endDate ? s.endDate.toISOString().split('T')[0] : '', status: s.status || 'Scheduled' }));
        }
        // Bills of Materials
        if (moduleSlug === 'bills-of-materials-bom') {
          const records = await this.prisma.billOfMaterial.findMany({ where: { companyId }, include: { items: { select: { id: true } } }, orderBy: { name: 'asc' } });
          // Resolve product names
          const productIds = [...new Set(records.map((b: any) => b.productId).filter(Boolean))];
          const products = productIds.length > 0 ? await this.prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true } }) : [];
          const productMap = new Map(products.map((p: any) => [p.id, p.name]));
          return records.map((b: any) => ({ id: b.id, name: b.name || '', product: productMap.get(b.productId) || b.productId || '', version: b.version || '1.0', totalCost: b.totalCost || 0, itemsCount: b.items?.length || 0, status: b.status || 'Active' }));
        }
        // Manufacturing Analytics (computed)
        if (moduleSlug === 'manufacturing-analytics') {
          const [workOrders, machines, qualityChecks] = await Promise.all([
            this.prisma.workOrder.findMany({ where: { companyId } }),
            this.prisma.machine.findMany({ where: { companyId } }),
            this.prisma.qualityCheck.findMany({ where: { companyId } }),
          ]);
          const total = workOrders.length;
          const completed = workOrders.filter((w: any) => w.status === 'COMPLETED').length;
          const inProduction = workOrders.filter((w: any) => w.status === 'IN_PRODUCTION' || w.status === 'PLANNED').length;
          const passed = qualityChecks.filter((q: any) => q.result === 'PASS').length;
          const avgUtilization = machines.length > 0 ? Math.round(machines.reduce((s: number, m: any) => s + (m.utilization || 0), 0) / machines.length) : 0;
          return [
            { metric: 'Total Work Orders', value: total.toString(), target: '50', achieved: Math.min(100, Math.round((total / 50) * 100)), trend: total > 0 ? 'Up' : 'Stable' },
            { metric: 'In Production', value: inProduction.toString(), target: '10', achieved: Math.min(100, Math.round((inProduction / 10) * 100)), trend: 'Stable' },
            { metric: 'Completion Rate', value: total > 0 ? Math.round((completed / total) * 100) + '%' : '0%', target: '90%', achieved: total > 0 ? Math.round((completed / total) * 100) : 0, trend: completed > 0 ? 'Up' : 'Stable' },
            { metric: 'Quality Pass Rate', value: qualityChecks.length > 0 ? Math.round((passed / qualityChecks.length) * 100) + '%' : '0%', target: '95%', achieved: qualityChecks.length > 0 ? Math.round((passed / qualityChecks.length) * 100) : 0, trend: 'Stable' },
            { metric: 'Avg Machine Utilization', value: avgUtilization + '%', target: '75%', achieved: avgUtilization, trend: avgUtilization >= 50 ? 'Up' : 'Stable' },
            { metric: 'Active Machines', value: machines.filter((m: any) => m.status === 'OPERATIONAL').length.toString(), target: '8', achieved: Math.min(100, Math.round((machines.filter((m: any) => m.status === 'OPERATIONAL').length / 8) * 100)), trend: 'Stable' },
          ];
        }
      }
      // ── CRM LEAD MANAGEMENT ────────────────────────────────────────────
      if (delegate === this.prisma.lead) {
        const records = await delegate.findMany({
          where: { companyId },
          orderBy: { createdAt: 'desc' },
        });
        const LEAD_SOURCE_LABELS: Record<string, string> = {
          WEBSITE: 'Website', REFERRAL: 'Referral', SOCIAL_MEDIA: 'Social Media',
          COLD_CALL: 'Cold Call', EMAIL_CAMPAIGN: 'Email Campaign', OTHER: 'Other',
        };
        const LEAD_STATUS_LABELS: Record<string, string> = {
          NEW: 'New', CONTACTED: 'Contacted', QUALIFIED: 'Qualified',
          PROPOSAL: 'Proposal', NEGOTIATION: 'Negotiation',
          CLOSED_WON: 'Closed Won', CLOSED_LOST: 'Lost',
        };
        return records.map((r: any) => ({
          id: r.id,
          name: r.name || '',
          email: r.email || '',
          phone: r.phone || '',
          company: r.company || '',
          source: LEAD_SOURCE_LABELS[r.source] || r.source || 'Other',
          stage: LEAD_STATUS_LABELS[r.status] || r.status || 'New',
          score: r.score || 0,
          notes: r.notes || '',
          value: r.estimatedValue || 0,
          estimatedValue: r.estimatedValue || 0,
          status: r.status || 'NEW',
          createdAt: r.createdAt ? r.createdAt.toISOString() : '',
          updatedAt: r.updatedAt ? r.updatedAt.toISOString() : '',
        }));
      }

      // ── TIME TRACKING (TimeSheet) ──────────────────────────────────────
      if (delegate === this.prisma.timeSheet) {
        const records = await delegate.findMany({
          where: { companyId },
          include: {
            employee: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { date: 'desc' },
        });
        return records.map((r: any) => ({
          id: r.id,
          employeeId: r.employeeId,
          employee: r.employee ? `${r.employee.firstName} ${r.employee.lastName}`.trim() : '',
          date: r.date ? r.date.toISOString().split('T')[0] : '',
          task: r.task || '',
          hoursWorked: r.hoursWorked || 0,
          status: r.status || 'SUBMITTED',
        }));
      }

      // ── Models without direct companyId (related through employee) ──
      if (delegate === this.prisma.leave) {
        const leaves = await delegate.findMany({
          where: { employee: { companyId } },
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                annualLeaveBalance: true,
                sickLeaveBalance: true,
                maternityLeave: true,
                paternityLeave: true,
                unpaidLeaveBalance: true,
                compassionateLeave: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
        // Map LeaveType → employee balance field
        const BALANCE_MAP: Record<string, string> = {
          ANNUAL: 'annualLeaveBalance',
          SICK: 'sickLeaveBalance',
          MATERNITY: 'maternityLeave',
          PATERNITY: 'paternityLeave',
          UNPAID: 'unpaidLeaveBalance',
        };
        return leaves.map((l: any) => {
          const emp = l.employee || {};
          const balanceField = BALANCE_MAP[l.type] || '';
          const balance = balanceField ? Number(emp[balanceField] || 0) : 0;
          const days = l.startDate && l.endDate
            ? Math.floor(Math.abs(new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
            : 0;
          const remaining = balanceField ? balance - days : null;
          return {
            ...l,
            employee: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
            employeeId: emp.id || '',
            leaveBalances: {
              annual: Number(emp.annualLeaveBalance || 0),
              sick: Number(emp.sickLeaveBalance || 0),
              maternity: Number(emp.maternityLeave || 0),
              paternity: Number(emp.paternityLeave || 0),
              unpaid: Number(emp.unpaidLeaveBalance || 0),
              compassionate: Number(emp.compassionateLeave || 0),
            },
            days,
            remainingDays: remaining,
          };
        });
      }
      if (delegate === this.prisma.attendance) {
        // Use explicit select to avoid non-existent columns (totalHours, overtimeHours, etc.)
        const records = await delegate.findMany({
          where: { employee: { companyId } },
          select: {
            id: true,
            employeeId: true,
            date: true,
            checkIn: true,
            checkOut: true,
            status: true,
            employee: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { date: 'desc' },
        });
        return records.map((r: any) => ({
          id: r.id,
          employeeId: r.employeeId,
          date: r.date,
          checkIn: r.checkIn,
          checkOut: r.checkOut,
          status: r.status,
          isLate: r.status === 'LATE',
          employee: r.employee ? `${r.employee.firstName} ${r.employee.lastName}`.trim() : '',
        }));
      }
      if (delegate === this.prisma.payroll) {
        const records = await delegate.findMany({
          where: { employee: { companyId } },
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                employeeCode: true,
                jobTitle: true,
                employmentType: true,
                status: true,
                department: { select: { name: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
        const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        const STATUS_MAP: Record<string, any> = {
          DRAFT: 'Draft',
          APPROVED: 'Approved',
          PAID: 'Paid',
          CANCELLED: 'Cancelled',
        };
        const fmtEnum = (v: any) => v ? String(v).replace(/_/g, ' ').replace(/\w\S*/g, (w: string) => w.charAt(0) + w.slice(1).toLowerCase()) : '';
        return records.map((r: any) => {
          const emp = r.employee || {};
          return {
            id: r.id,
            employee: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
            employeeId: emp.id || '',
            employeeCode: emp.employeeCode || '',
            department: emp.department?.name || '',
            position: emp.jobTitle || '',
            employmentType: fmtEnum(emp.employmentType),
            empStatus: fmtEnum(emp.status),
            period: `${MONTH_NAMES[r.month - 1] || r.month} ${r.year}`,
            basic: r.baseSalary,
            allowance: r.allowances,
            deduction: r.deductions,
            tax: r.tax,
            net: r.netSalary,
            status: STATUS_MAP[r.status] || r.status,
            paymentDate: r.paymentDate ? r.paymentDate.toISOString().split('T')[0] : '',
            notes: r.notes || '',
            month: r.month,
            year: r.year,
            baseSalary: r.baseSalary,
            prismaId: r.id,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          };
        });
      }

      if (delegate === this.prisma.employee) {
        const emps = await delegate.findMany({
          where: { companyId },
          include: {
            department: { select: { name: true } },
            educations: true,
            certifications: true,
            children: true,
            empDocuments: true,
            experiences: true,
            skills: true,
          },
          orderBy: { createdAt: 'desc' },
        });
        return emps.map(emp => ({
          ...emp,
          name: `${emp.firstName} ${emp.lastName}`.trim(),
          id: emp.employeeCode,
          prismaId: emp.id, // preserve original UUID for edit/delete operations
          position: emp.jobTitle,
          department: emp.department?.name || '',
          startDate: emp.hireDate ? emp.hireDate.toISOString().split('T')[0] : '',
          dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.toISOString().split('T')[0] : '',
          status: emp.status ? emp.status.replace(/_/g, ' ').replace(/\w\S*/g, w => w.charAt(0) + w.slice(1).toLowerCase()) : '',
          employmentType: emp.employmentType ? emp.employmentType.replace(/_/g, ' ').replace(/\w\S*/g, w => w.charAt(0) + w.slice(1).toLowerCase()) : '',
          gender: emp.gender ? emp.gender.charAt(0) + emp.gender.slice(1).toLowerCase() : '',
          nationality: emp.nationality || '',
          maritalStatus: emp.maritalStatus ? emp.maritalStatus.charAt(0) + emp.maritalStatus.slice(1).toLowerCase() : '',
          salaryType: emp.salaryType ? emp.salaryType.charAt(0) + emp.salaryType.slice(1).toLowerCase() : '',
        }));
      }

      // Default fallback if we know there is a createdAt
      return delegate.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' } });
    } catch (e) {
      // If ordering fails (e.g., no createdAt field), try falling back without it
      try {
        return delegate.findMany({ where: { companyId } });
      } catch (err) {
        return [];
      }
    }
  }

  async getDataById(pillarSlug: string, moduleSlug: string, id: string, companyId: string): Promise<any> {
    const delegate = this.getModelDelegate(pillarSlug, moduleSlug) as any;
    if (!delegate) return null;
    if (!companyId) {
      const firstCompany = await this.prisma.company.findFirst();
      companyId = firstCompany?.id ?? '';
    }
    // For invoice, include items
    if (pillarSlug === 'crm-sales' && (moduleSlug === 'invoicing')) {
      try {
        const inv = await this.prisma.invoice.findUnique({
          where: { id },
          include: {
            customer: { select: { name: true } },
            deal: { select: { id: true, title: true } },
            items: { select: { id: true, description: true, quantity: true, unitPrice: true, total: true } },
          },
        });
        if (!inv) return null;
        const STATUS_LABELS: Record<string, string> = { DRAFT: 'Draft', SENT: 'Sent', PAID: 'Paid', OVERDUE: 'Overdue', CANCELLED: 'Cancelled' };
        return {
          id: inv.id,
          invoiceNo: inv.invoiceNo,
          customer: inv.customer?.name || '',
          customerId: inv.customerId || '',
          deal: inv.deal?.title || '',
          dealId: inv.dealId || '',
          issueDate: inv.issueDate ? inv.issueDate.toISOString().split('T')[0] : '',
          dueDate: inv.dueDate ? inv.dueDate.toISOString().split('T')[0] : '',
          subTotal: inv.subTotal || 0,
          taxAmount: inv.taxAmount || 0,
          total: inv.total || 0,
          status: STATUS_LABELS[inv.status] || inv.status,
          notes: inv.notes || '',
          items: inv.items || [],
          createdAt: inv.createdAt ? inv.createdAt.toISOString() : '',
          updatedAt: inv.updatedAt ? inv.updatedAt.toISOString() : '',
        };
      } catch { return null; }
    }
    // For employee, return full record with balances
    if (pillarSlug === 'human-resources' && moduleSlug === 'employee-management') {
      const emp = await this.prisma.employee.findFirst({
        where: { id, companyId },
        include: { department: { select: { name: true } } },
      });
      if (!emp) return null;
      return {
        ...emp,
        name: `${emp.firstName} ${emp.lastName}`.trim(),
        annualLeaveBalance: Number(emp.annualLeaveBalance || 0),
        sickLeaveBalance: Number(emp.sickLeaveBalance || 0),
        maternityLeave: Number(emp.maternityLeave || 0),
        paternityLeave: Number(emp.paternityLeave || 0),
        unpaidLeaveBalance: Number(emp.unpaidLeaveBalance || 0),
        compassionateLeave: Number(emp.compassionateLeave || 0),
      };
    }
    // Generic fallback
    try {
      return delegate.findUnique({ where: { id } });
    } catch {
      return null;
    }
  }

  async searchProducts(companyId: string, query: string): Promise<any[]> {
    if (!companyId) {
      const firstCompany = await this.prisma.company.findFirst();
      companyId = firstCompany?.id ?? '';
    }
    const products = await this.prisma.product.findMany({
      where: {
        companyId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
          { barcode: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
        stock: true,
        sellPrice: true,
      },
      orderBy: { name: 'asc' },
      take: 15,
    });
    return products.map(p => ({
      id: p.id,
      label: p.name,
      sku: p.sku,
      category: p.category || '',
      stock: p.stock || 0,
      sellPrice: p.sellPrice || 0,
    }));
  }

  async searchWarehouses(companyId: string, query: string): Promise<any[]> {
    if (!companyId) {
      const firstCompany = await this.prisma.company.findFirst();
      companyId = firstCompany?.id ?? '';
    }
    const warehouses = await this.prisma.warehouse.findMany({
      where: {
        companyId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { code: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        code: true,
        location: true,
        capacity: true,
      },
      orderBy: { name: 'asc' },
      take: 15,
    });
    return warehouses.map(w => ({
      id: w.id,
      label: w.name,
      code: w.code || '',
      location: w.location || '',
      capacity: w.capacity || 0,
    }));
  }

  async searchMachines(companyId: string, query: string): Promise<any[]> {
    if (!companyId) {
      const firstCompany = await this.prisma.company.findFirst();
      companyId = firstCompany?.id ?? '';
    }
    return this.prisma.machine.findMany({
      where: {
        companyId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { machineNo: { contains: query, mode: 'insensitive' } },
          { model: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, machineNo: true, model: true, status: true, location: true },
    });
  }

  async searchEmployees(companyId: string, query: string): Promise<any[]> {
    if (!companyId) {
      const firstCompany = await this.prisma.company.findFirst();
      companyId = firstCompany?.id ?? '';
    }
    const employees = await this.prisma.employee.findMany({
      where: {
        companyId,
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { employeeCode: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        department: { select: { name: true } },
      },
      orderBy: { firstName: 'asc' },
      take: 15,
    });
    return employees.map(emp => ({
      id: emp.id,
      label: `${emp.firstName} ${emp.lastName}`.trim(),
      employeeCode: emp.employeeCode,
      position: emp.jobTitle,
      department: emp.department?.name || '',
    }));
  }

  async hireCandidate(candidateId: string, companyId: string): Promise<any> {
    // Fallback if no companyId from token
    if (!companyId) {
      const firstCompany = await this.prisma.company.findFirst();
      companyId = firstCompany?.id ?? '';
    }

    const candidate = await this.prisma.recruitmentCandidate.findUnique({
      where: { id: candidateId, companyId }
    });
    if (!candidate) throw new NotFoundException('Candidate not found');

    // Create an employee from the candidate data
    const nameParts = candidate.name.split(' ');
    const firstName = nameParts[0] || candidate.name;
    const lastName = nameParts.slice(1).join(' ') || 'New Employee';

    // Get count for employee code
    const count = await this.prisma.employee.count({ where: { companyId } });
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    const companyAbbr = company?.name?.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 4) || 'NXV';
    const employeeCode = `${companyAbbr}-EMP-${String(count + 1).padStart(4, '0')}`;

    // Create a user for the employee
    const userEmail = candidate.email || `${candidate.name.toLowerCase().replace(/\s+/g, '.')}@nexyovi.com`;
    let user = await this.prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: userEmail,
          password: 'ChangeMe@123',
          firstName,
          lastName,
          role: 'EMPLOYEE',
          companyId,
        }
      });
    }

    // Create the employee record
    const employee = await this.prisma.employee.create({
      data: {
        employeeCode,
        firstName,
        lastName,
        personalEmail: candidate.email,
        personalPhone: candidate.phone,
        jobTitle: candidate.position,
        hireDate: new Date(),
        status: 'ACTIVE',
        companyId,
        userId: user.id,
      }
    });

    // Update candidate stage to HIRED
    await this.prisma.recruitmentCandidate.update({
      where: { id: candidateId },
      data: { stage: 'HIRED' }
    });

    return { employee, candidate: { ...candidate, stage: 'HIRED' } };
  }

  // ── PAYROLL SETTINGS ────────────────────────────────────────────────────
  async getPayrollSettings(companyId: string): Promise<any> {
    if (!companyId) {
      const firstCompany = await this.prisma.company.findFirst();
      companyId = firstCompany?.id ?? '';
    }
    try {
      const settings = await this.prisma.payrollSetting.findUnique({
        where: { companyId },
      });
      if (!settings) {
        // Create default settings — if table doesn't exist, return defaults
        return await this.prisma.payrollSetting.create({
          data: { companyId },
        }).catch(() => ({ ...this.PAYROLL_SETTINGS_DEFAULTS }));
      }
      return settings;
    } catch {
      return { ...this.PAYROLL_SETTINGS_DEFAULTS };
    }
  }

  async upsertPayrollSettings(companyId: string, data: any): Promise<any> {
    if (!companyId) {
      const firstCompany = await this.prisma.company.findFirst();
      companyId = firstCompany?.id ?? '';
    }
    // Only allow updating known boolean fields
    const allowedFields = Object.keys(this.PAYROLL_SETTINGS_DEFAULTS);
    const updateData: Record<string, boolean> = {};
    for (const field of allowedFields) {
      if (typeof data[field] === 'boolean') {
        updateData[field] = data[field];
      }
    }
    try {
      const settings = await this.prisma.payrollSetting.upsert({
        where: { companyId },
        create: { companyId, ...updateData },
        update: updateData,
      });
      return settings;
    } catch {
      // If table doesn't exist, return the intended settings as defaults
      return { companyId, ...this.PAYROLL_SETTINGS_DEFAULTS, ...updateData };
    }
  }

  async generatePayrollForMonth(companyId: string, month: number, year: number): Promise<any> {
    if (!companyId) {
      const firstCompany = await this.prisma.company.findFirst();
      companyId = firstCompany?.id ?? '';
    }

    // ── Load settings (or create defaults) ────────────────────────────────
    const settings = await this.getPayrollSettings(companyId);
    const INCLUDE = {
      overtime:        settings?.includeAttendanceOvertime ?? true,
      absence:         settings?.includeAbsenceDeductions ?? true,
      late:            settings?.includeLatePenalties ?? true,
      unpaidLeave:     settings?.includeUnpaidLeaveDeductions ?? true,
      bonuses:         settings?.includeBonuses ?? true,
      tax:             settings?.autoCalculateTax ?? true,
      pension:         settings?.includePension ?? true,
      workDayBased:    settings?.useWorkDayBasedPay ?? false,
    };

    // Get all active employees with full compensation info
    const employees = await this.prisma.employee.findMany({
      where: { companyId, status: 'ACTIVE' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        salary: true,
        allowances: true,
        bonuses: true,
        pensionContribution: true,
        taxId: true,
      },
    });

    if (employees.length === 0) {
      throw new BadRequestException('No active employees found to generate payroll for.');
    }

    // Check which employees already have payroll for this month
    const existingPayrolls = await this.prisma.payroll.findMany({
      where: { employee: { companyId }, month, year },
      select: { employeeId: true },
    });
    const existingEmployeeIds = new Set(existingPayrolls.map(p => p.employeeId));

    // ── Build month date range ────────────────────────────────────────
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

    // ── Conditionally fetch attendance & leave ──────────────────────────
    let attendances: any[] = [];
    let leaves: any[] = [];

    if (INCLUDE.overtime || INCLUDE.absence || INCLUDE.late || INCLUDE.workDayBased) {
      // Only select columns that actually exist in the database
      // (avoiding totalHours, overtimeHours, isLate, earlyDeparture which
      //  may not have been migrated yet)
      const rawAttendances = await this.prisma.attendance.findMany({
        where: {
          employee: { companyId },
          date: { gte: monthStart, lte: monthEnd },
        },
        select: {
          employeeId: true,
          date: true,
          checkIn: true,
          checkOut: true,
          status: true,
        },
      });
      // Map to include derived fields so downstream code doesn't break
      attendances = rawAttendances.map((a: any) => {
        // Calculate overtime from checkIn/checkOut if available
        let overtimeHours = 0;
        if (a.checkIn && a.checkOut) {
          const workedHrs = (a.checkOut.getTime() - a.checkIn.getTime()) / (1000 * 60 * 60);
          overtimeHours = Math.round(Math.max(0, workedHrs - 8) * 100) / 100; // beyond 8h
        }
        return {
          employeeId: a.employeeId,
          date: a.date,
          status: a.status,
          isLate: a.status === 'LATE',
          overtimeHours,
        };
      });
    }

    if (INCLUDE.unpaidLeave) {
      leaves = await this.prisma.leave.findMany({
        where: {
          employee: { companyId },
          status: 'APPROVED',
          startDate: { lte: monthEnd },
          endDate: { gte: monthStart },
        },
        select: {
          employeeId: true,
          type: true,
          startDate: true,
          endDate: true,
        },
      });
    }

    // ── Group attendance by employee ────────────────────────────────────
    const attendanceByEmp: Record<string, any[]> = {};
    for (const a of attendances) {
      if (!attendanceByEmp[a.employeeId]) attendanceByEmp[a.employeeId] = [];
      attendanceByEmp[a.employeeId].push(a);
    }

    // ── Group leave by employee ─────────────────────────────────────────
    const leaveByEmp: Record<string, any[]> = {};
    for (const l of leaves) {
      if (!leaveByEmp[l.employeeId]) leaveByEmp[l.employeeId] = [];
      leaveByEmp[l.employeeId].push(l);
    }

    const created: any[] = [];
    const skipped: string[] = [];
    const appliedModules: string[] = [];
    if (INCLUDE.workDayBased) appliedModules.push('Work-Day Based Pay');
    if (INCLUDE.overtime) appliedModules.push('Overtime');
    if (INCLUDE.absence) appliedModules.push('Absence');
    if (INCLUDE.late) appliedModules.push('Late Penalty');
    if (INCLUDE.unpaidLeave) appliedModules.push('Unpaid Leave');
    if (INCLUDE.bonuses) appliedModules.push('Bonuses');
    if (INCLUDE.tax) appliedModules.push('Tax');
    if (INCLUDE.pension) appliedModules.push('Pension');

    for (const emp of employees) {
      if (existingEmployeeIds.has(emp.id)) {
        skipped.push(`${emp.firstName} ${emp.lastName}`);
        continue;
      }

      const baseSalary = emp.salary || 0;
      const allowancesAmount = emp.allowances || 0;
      const bonusesAmount = INCLUDE.bonuses ? (emp.bonuses || 0) : 0;
      const dailyRate = baseSalary / 30;
      const hourlyRate = dailyRate / 8;

      // ── Attendance calculations (conditional) ───────────────────────────
      const empAttendance = attendanceByEmp[emp.id] || [];
      let totalOvertimeHours = 0;
      let absentDays = 0;
      let lateDays = 0;
      let halfDays = 0;
      let presentDays = 0;

      for (const att of empAttendance) {
        if (INCLUDE.overtime) totalOvertimeHours += att.overtimeHours || 0;
        if (att.status === 'PRESENT') presentDays++;
        if (INCLUDE.absence && att.status === 'ABSENT') absentDays++;
        if (INCLUDE.late && (att.isLate || att.status === 'LATE')) lateDays++;
        if (INCLUDE.absence && att.status === 'HALF_DAY') halfDays++;
      }

      // ── Leave calculations (conditional, only UNPAID) ────────────────────
      const empLeaves = leaveByEmp[emp.id] || [];
      let unpaidLeaveDays = 0;

      if (INCLUDE.unpaidLeave) {
        for (const lv of empLeaves) {
          if (lv.type !== 'UNPAID') continue;
          const overlapStart = lv.startDate > monthStart ? lv.startDate : monthStart;
          const overlapEnd = lv.endDate < monthEnd ? lv.endDate : monthEnd;
          const days = Math.max(0, Math.floor((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
          unpaidLeaveDays += days;
        }
      }

      // ── Overtime pay ────────────────────────────────────────────────────
      const overtimePay = totalOvertimeHours * hourlyRate * 1.5;

      // ── Late penalty (always applied when attendance is on) ────────────────
      const latePenalty = lateDays * (dailyRate * 0.25);

      // ── Gross income ────────────────────────────────────────────────────
      let grossIncome: number;
      let noteParts: string[] = [];

      if (INCLUDE.workDayBased) {
        // ── WORK-DAY BASED PAY: pay only for days actually worked ─────────
        const daysWorked = presentDays + (halfDays * 0.5);
        const salaryPortion = dailyRate * daysWorked;
        const allowancePortion = (allowancesAmount / 30) * daysWorked;
        grossIncome = Math.max(0, salaryPortion + allowancePortion + bonusesAmount + overtimePay - latePenalty);
        noteParts = [
          `Work days: ${daysWorked.toFixed(1)}d (${presentDays} present + ${halfDays} half)`,
          `Salary: ETB ${Math.round(salaryPortion).toLocaleString()} (${Number(baseSalary).toLocaleString()} ÷ 30 × ${daysWorked.toFixed(1)})`,
        ];
        if (allowancesAmount) noteParts.push(`Allowances prorated: ETB ${Math.round(allowancePortion).toLocaleString()}`);
      } else {
        // ── FULL-MONTH MINUS DEDUCTIONS: standard approach ────────────────
        const absenceDeduction = absentDays * dailyRate;
        const halfDayDeduction = halfDays * (dailyRate * 0.5);
        const unpaidLeaveDeduction = unpaidLeaveDays * dailyRate;
        const totalDeductionsFromTime = absenceDeduction + halfDayDeduction + latePenalty + unpaidLeaveDeduction;
        grossIncome = Math.max(0, baseSalary + allowancesAmount + bonusesAmount + overtimePay - totalDeductionsFromTime);
        noteParts = [`Base: ETB ${baseSalary.toLocaleString()}`];
        if (allowancesAmount) noteParts.push(`Allowances: ETB ${allowancesAmount.toLocaleString()}`);
        if (INCLUDE.absence && absentDays) noteParts.push(`Absent ${absentDays}d: -ETB ${Math.round(absenceDeduction).toLocaleString()}`);
        if (INCLUDE.absence && halfDays) noteParts.push(`Half-day ${halfDays}d: -ETB ${Math.round(halfDayDeduction).toLocaleString()}`);
        if (INCLUDE.unpaidLeave && unpaidLeaveDays) {
          noteParts.push(`Unpaid ${unpaidLeaveDays}d: -ETB ${Math.round(unpaidLeaveDeduction).toLocaleString()}`);
        }
      }

      // ── Tax & Pension (conditional) ─────────────────────────────────────
      let tax = 0;
      let pension = 0;
      let totalDeductions = 0;

      if (INCLUDE.tax) {
        if (grossIncome <= 600) {
          tax = 0;
        } else if (grossIncome <= 1650) {
          tax = (grossIncome - 600) * 0.10;
        } else if (grossIncome <= 3200) {
          tax = 105 + (grossIncome - 1650) * 0.15;
        } else if (grossIncome <= 5250) {
          tax = 337.5 + (grossIncome - 3200) * 0.20;
        } else if (grossIncome <= 7800) {
          tax = 747.5 + (grossIncome - 5250) * 0.25;
        } else if (grossIncome <= 10900) {
          tax = 1385 + (grossIncome - 7800) * 0.30;
        } else {
          tax = 2315 + (grossIncome - 10900) * 0.35;
        }
      }

      if (INCLUDE.pension) {
        pension = emp.pensionContribution ?? baseSalary * 0.07;
      }

      totalDeductions = tax + pension;
      const netSalary = Math.max(0, grossIncome - totalDeductions);

      const roundedTax = Math.round(tax * 100) / 100;
      const roundedDeductions = Math.round(totalDeductions * 100) / 100;
      const roundedNet = Math.round(netSalary * 100) / 100;

      // ── Build shared note parts (common to both modes) ───────────────────
      if (INCLUDE.bonuses && bonusesAmount) noteParts.push(`Bonuses: ETB ${bonusesAmount.toLocaleString()}`);
      if (INCLUDE.overtime && totalOvertimeHours) {
        noteParts.push(`${totalOvertimeHours}h overtime: ETB ${Math.round(overtimePay).toLocaleString()}`);
      }
      if (INCLUDE.late && lateDays) noteParts.push(`Late ${lateDays}d: -ETB ${Math.round(latePenalty).toLocaleString()}`);
      if (INCLUDE.pension) noteParts.push(`Pension: ETB ${Math.round(pension).toLocaleString()}`);
      if (INCLUDE.tax) noteParts.push(`Tax: ETB ${Math.round(tax).toLocaleString()}`);

      const notes = noteParts.join(' | ');

      const payroll = await this.prisma.payroll.create({
        data: {
          employeeId: emp.id,
          month,
          year,
          baseSalary,
          allowances: allowancesAmount,
          deductions: roundedDeductions,
          tax: roundedTax,
          netSalary: roundedNet,
          status: 'DRAFT',
          notes,
        },
      });

      created.push(payroll);
    }

    return {
      month,
      year,
      totalCreated: created.length,
      totalSkipped: skipped.length,
      skippedNames: skipped,
      appliedModules,
      created,
    };
  }

  /**
   * Parse a human-readable size string (e.g. "1.2 MB", "500 KB", "2 GB")
   * back into bytes (Int) for Prisma Int columns.
   * If size is already a number, returns as-is. If absent/empty, returns 0.
   */
  private parseDocSize(data: any, pillarSlug: string): any {
    if (pillarSlug !== 'document-management') return data;
    const size = data.size;
    if (size === undefined || size === null || size === '') {
      data.size = 0;
    } else if (typeof size === 'number') {
      // Already bytes — keep as-is
    } else if (typeof size === 'string') {
      const match = size.trim().match(/^([\d.]+)\s*(B|KB|MB|GB|TB)?$/i);
      if (match) {
        const num = parseFloat(match[1]);
        const unit = (match[2] || 'B').toUpperCase();
        const multipliers = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024, TB: 1024 * 1024 * 1024 * 1024 };
        data.size = Math.round(num * (multipliers[unit] || 1));
      } else {
        data.size = 0;
      }
    }
    return data;
  }

  async createData(pillarSlug: string, moduleSlug: string, companyId: string, data: any): Promise<any> {
    const delegate = this.getModelDelegate(pillarSlug, moduleSlug) as any;
    if (!delegate) return { message: `Record created (mock: ${moduleSlug})`, data };

    // If no companyId from token, fall back to first company in DB
    if (!companyId) {
      const firstCompany = await this.prisma.company.findFirst();
      companyId = firstCompany?.id ?? '';
    }

    if (pillarSlug === 'human-resources' && moduleSlug === 'employee-management') {
      const { educations, certifications, children, empDocuments, experiences, skills, user, ...rawData } = data;

      // ── Strip all non-Prisma-schema fields ────────────────────────
      const EMPLOYEE_FIELDS = new Set([
        'employeeCode','firstName','middleName','lastName','preferredName','dateOfBirth','gender',
        'nationality','ethnicity','religion','maritalStatus','bloodType','profilePhoto',
        'personalEmail','workEmail','personalPhone','workPhone','address','city','region','country','postalCode',
        'nationalId','nationalIdExpiry','passportNumber','passportExpiry',
        'driverLicenseNumber','driverLicenseClass','driverLicenseExpiry',
        'tinNumber','pensionId','workPermit','workPermitExpiry','visaStatus',
        'jobTitle','employmentType','status','hireDate','probationEndDate','confirmationDate',
        'terminationDate','terminationReason','noticePeriodDays','contractType','contractEndDate',
        'workLocation','workShift','branchOffice','gradeLevel','costCenter',
        'salary','salaryType','currency','allowances','bankName','bankAccount','bankBranch',
        'taxId','taxBracket','pensionContribution','paymentMethod','accountHolderName','bonuses',
        'disabilityStatus','medicalConditions','emergencyMedical','vaccinationStatus','medicalInsurance','medicalInsuranceNo',
        'emergencyName','emergencyRelation','emergencyPhone','emergencyEmail',
        'annualLeaveBalance','sickLeaveBalance','maternityLeave','paternityLeave',
        'unpaidLeaveBalance','compassionateLeave','otherLeaveTypes',
        'departmentId','managerId',
      ]);

      const DATE_FIELDS = new Set([
        'dateOfBirth','nationalIdExpiry','passportExpiry','driverLicenseExpiry','workPermitExpiry',
        'hireDate','probationEndDate','confirmationDate','terminationDate','contractEndDate',
      ]);

      const FLOAT_FIELDS = new Set([
        'salary','allowances','pensionContribution','bonuses',
        'annualLeaveBalance','sickLeaveBalance','maternityLeave','paternityLeave',
        'unpaidLeaveBalance','compassionateLeave',
      ]);

      // Enum field normalisation maps
      const GENDER_MAP: Record<string, string> = {
        male: 'MALE', female: 'FEMALE', other: 'OTHER', unspecified: 'UNSPECIFIED',
        m: 'MALE', f: 'FEMALE',
      };
      const MARITAL_MAP: Record<string, string> = {
        single: 'SINGLE', married: 'MARRIED', divorced: 'DIVORCED',
        widowed: 'WIDOWED', separated: 'SEPARATED',
      };
      const EMPLOYMENT_MAP: Record<string, string> = {
        full_time: 'FULL_TIME', 'full time': 'FULL_TIME', fulltime: 'FULL_TIME',
        part_time: 'PART_TIME', 'part time': 'PART_TIME', parttime: 'PART_TIME',
        contract: 'CONTRACT', intern: 'INTERN', freelance: 'FREELANCE',
      };
      const STATUS_MAP: Record<string, any> = {
        active: 'ACTIVE', inactive: 'INACTIVE', on_leave: 'ON_LEAVE',
        terminated: 'TERMINATED', probation: 'PROBATION', suspended: 'SUSPENDED',
      };
      const SALARY_MAP: Record<string, string> = {
        monthly: 'MONTHLY', daily: 'DAILY', hourly: 'HOURLY',
      };

      // Build clean employee object
      const employeeData: Record<string, any> = {};
      for (const [key, val] of Object.entries(rawData)) {
        if (!EMPLOYEE_FIELDS.has(key)) continue;
        if (DATE_FIELDS.has(key)) {
          employeeData[key] = val && val !== '' ? new Date(val as string) : null;
        } else if (FLOAT_FIELDS.has(key)) {
          employeeData[key] = val !== '' && val !== null && val !== undefined ? Number(val) : 0;
        } else {
          employeeData[key] = val === '' ? null : val;
        }
      }

      // Normalise enum fields
      if (employeeData.gender) {
        employeeData.gender = GENDER_MAP[(employeeData.gender as string).toLowerCase()] ?? 'UNSPECIFIED';
      } else {
        employeeData.gender = 'UNSPECIFIED';
      }
      if (employeeData.maritalStatus) {
        employeeData.maritalStatus = MARITAL_MAP[(employeeData.maritalStatus as string).toLowerCase()] ?? 'SINGLE';
      } else {
        employeeData.maritalStatus = 'SINGLE';
      }
      if (employeeData.employmentType) {
        employeeData.employmentType = EMPLOYMENT_MAP[(employeeData.employmentType as string).toLowerCase()] ?? 'FULL_TIME';
      } else {
        employeeData.employmentType = 'FULL_TIME';
      }
      if (employeeData.status) {
        employeeData.status = STATUS_MAP[(employeeData.status as string).toLowerCase()] ?? 'ACTIVE';
      } else {
        employeeData.status = 'ACTIVE';
      }
      if (employeeData.salaryType) {
        employeeData.salaryType = SALARY_MAP[(employeeData.salaryType as string).toLowerCase()] ?? 'MONTHLY';
      } else {
        employeeData.salaryType = 'MONTHLY';
      }

      // Ensure required fields
      if (!employeeData.employeeCode) throw new Error('employeeCode is required');
      if (!employeeData.firstName)    throw new Error('firstName is required');
      if (!employeeData.lastName)     throw new Error('lastName is required');
      if (!employeeData.hireDate)     employeeData.hireDate = new Date();

      // Sanitize relation IDs to ensure they are valid UUIDs
      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
      if (employeeData.departmentId && !uuidRegex.test(employeeData.departmentId)) {
        employeeData.departmentId = null;
      }
      if (employeeData.managerId && !uuidRegex.test(employeeData.managerId)) {
        employeeData.managerId = null;
      }


      // Strip per-item UI-only fields from sub-arrays and map schema differences
      const cleanEducations = (educations || []).map(({ certificateFileName, graduationYear, endDate, ...e }: any) => {
        let finalEndDate: Date | null = null;
        if (endDate) finalEndDate = new Date(endDate);
        else if (graduationYear) finalEndDate = new Date(graduationYear);
        return {
          ...e,
          endDate: finalEndDate,
          gpa: e.gpa ? parseFloat(e.gpa) : null
        };
      });

      const cleanExperiences = (experiences || []).map(({ referenceFileName, referenceUrl, ...e }: any) => ({
        ...e,
        startDate: e.startDate ? new Date(e.startDate) : null,
        endDate: e.endDate ? new Date(e.endDate) : null,
      }));

      const cleanSkills = (skills || []);
      const cleanChildren = (children || []).map((e: any) => ({
        ...e,
        dateOfBirth: e.dateOfBirth ? new Date(e.dateOfBirth) : null,
        gender: GENDER_MAP[(e.gender as string)?.toLowerCase()] ?? 'UNSPECIFIED'
      }));

      const cleanCertifications = (certifications || []);
      const cleanDocs = (empDocuments || []);

      // Auto-create a linked user
      let userId = rawData.userId;
      if (!userId) {
        const email = employeeData.personalEmail || employeeData.workEmail || `${employeeData.employeeCode}@nexyovi.com`;
        // Check if user with this email already exists
        const existingUser = await this.prisma.user.findUnique({ 
          where: { email },
          include: { employee: true }
        });
        
        if (existingUser) {
          if (existingUser.employee) {
            throw new Error(`A user with email ${email} is already linked to an employee record.`);
          }
          userId = existingUser.id;
        } else {
          const newUser = await this.prisma.user.create({
            data: {
              email,
              password: 'ChangeMe@123',
              firstName: employeeData.firstName,
              lastName: employeeData.lastName,
              role: 'EMPLOYEE',
              companyId,
            }
          });
          userId = newUser.id;
        }
      } else {
        // If userId was provided, check if it already has an employee
        const existingEmp = await this.prisma.employee.findUnique({ where: { userId } });
        if (existingEmp) {
          throw new Error(`The provided user ID is already linked to an employee record.`);
        }
      }

      const newEmployee = await delegate.create({
        data: {
          ...employeeData,
          companyId,
          userId,
          educations:      cleanEducations.length      ? { create: cleanEducations }      : undefined,
          certifications:  cleanCertifications.length  ? { create: cleanCertifications }  : undefined,
          children:        cleanChildren.length        ? { create: cleanChildren }        : undefined,
          empDocuments:    cleanDocs.length            ? { create: cleanDocs }            : undefined,
          experiences:     cleanExperiences.length     ? { create: cleanExperiences }     : undefined,
          skills:          cleanSkills.length          ? { create: cleanSkills }          : undefined,
        }
      });

      // ── AUTO-CREATE TODAY'S ATTENDANCE RECORD ──────────────────────
      // Sync the new employee into the attendance system so they appear
      // in the attendance dashboard immediately. Only create for active employees.
      const isActive = employeeData.status === 'ACTIVE' || !employeeData.status;
      if (isActive) {
        try {
          await this.prisma.attendance.create({
            data: {
              employeeId: newEmployee.id,
              date: new Date(),
              status: 'PRESENT',
            },
          });
        } catch (attErr) {
          // Attendance creation is a non-critical side-effect; log and continue
          console.warn('Warning: Could not auto-create attendance record:', String(attErr));
        }
      }

      return newEmployee;
    }

    // ── LEAVE MANAGEMENT: map employee name → employeeId, validate enum values ──
    if (pillarSlug === 'human-resources' && moduleSlug === 'leave-management') {
      const leaveData: Record<string, any> = { ...data };

      // Map employee name to employeeId
      if (leaveData.employee && typeof leaveData.employee === 'string') {
        const searchTerm = leaveData.employee.trim();
        const nameParts = searchTerm.split(/\s+/);

        const where: any[] = [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { employeeCode: { equals: searchTerm, mode: 'insensitive' } },
        ];

        // Also search by first + last name combined (e.g. "Yonas Alemu")
        if (nameParts.length >= 2) {
          where.push({
            firstName: { contains: nameParts[0], mode: 'insensitive' },
            lastName: { contains: nameParts.slice(1).join(' '), mode: 'insensitive' },
          });
        }

        const employee = await this.prisma.employee.findFirst({
          where: { companyId, OR: where },
          orderBy: { createdAt: 'desc' },
        });
        if (employee) {
          leaveData.employeeId = employee.id;
        } else {
          throw new NotFoundException(`Employee "${leaveData.employee}" not found`);
        }
        delete leaveData.employee;
      } else if (leaveData.employeeId) {
        delete leaveData.employee;
      } else {
        throw new BadRequestException('employee or employeeId is required');
      }

      // Validate & normalize date fields
      if (leaveData.startDate) leaveData.startDate = new Date(leaveData.startDate);
      if (leaveData.endDate) leaveData.endDate = new Date(leaveData.endDate);

      // Validate leave type enum
      const VALID_TYPES = ['ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'UNPAID', 'OTHER'];
      if (leaveData.type) {
        const upper = String(leaveData.type).toUpperCase();
        leaveData.type = VALID_TYPES.includes(upper) ? upper : 'OTHER';
      }

      // Validate leave status enum
      const VALID_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
      if (leaveData.status) {
        const upper = String(leaveData.status).toUpperCase();
        leaveData.status = VALID_STATUSES.includes(upper) ? upper : 'PENDING';
      } else {
        leaveData.status = 'PENDING';
      }

      // Strip any non-schema fields
      delete leaveData.days;
      delete leaveData.companyId; // Leave model has no direct companyId — linked through employee

      return delegate.create({ data: leaveData });
    }

    // ── PAYROLL field mapping: frontend keys → Prisma model fields ──
    if (pillarSlug === 'human-resources' && moduleSlug === 'payroll') {
      const payrollData: Record<string, any> = { ...data };

      // Map employee name to employeeId
      if (payrollData.employee && typeof payrollData.employee === 'string') {
        const searchTerm = payrollData.employee.trim();
        const nameParts = searchTerm.split(/\s+/);
        const where: any[] = [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { employeeCode: { equals: searchTerm, mode: 'insensitive' } },
        ];
        if (nameParts.length >= 2) {
          where.push({
            firstName: { contains: nameParts[0], mode: 'insensitive' },
            lastName: { contains: nameParts.slice(1).join(' '), mode: 'insensitive' },
          });
        }
        const employee = await this.prisma.employee.findFirst({
          where: { companyId, OR: where },
          orderBy: { createdAt: 'desc' },
        });
        if (employee) {
          payrollData.employeeId = employee.id;
          // Copy salary info from employee for auto-calculation
          payrollData.baseSalary = payrollData.basic ?? employee.salary ?? 0;
          payrollData.allowances = payrollData.allowance ?? employee.allowances ?? 0;
        } else {
          throw new NotFoundException(`Employee "${payrollData.employee}" not found`);
        }
      } else if (payrollData.employeeId) {
        const employee = await this.prisma.employee.findUnique({ where: { id: payrollData.employeeId } });
        if (employee) {
          payrollData.baseSalary = payrollData.basic ?? employee.salary ?? 0;
          payrollData.allowances = payrollData.allowance ?? employee.allowances ?? 0;
        }
      }

      // Parse period into month/year
      if (payrollData.period) {
        const periodMatch = String(payrollData.period).match(/([A-Za-z]+)\s*(\d{4})/);
        if (periodMatch) {
          const MONTH_MAP: Record<string, number> = {
            january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
            july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
          };
          payrollData.month = MONTH_MAP[periodMatch[1].toLowerCase()] || new Date().getMonth() + 1;
          payrollData.year = parseInt(periodMatch[2]) || new Date().getFullYear();
        }
      } else {
        payrollData.month = payrollData.month || new Date().getMonth() + 1;
        payrollData.year = payrollData.year || new Date().getFullYear();
      }

      // Map frontend fields to Prisma fields
      if (payrollData.basic !== undefined) payrollData.baseSalary = Number(payrollData.basic);
      if (payrollData.allowance !== undefined) payrollData.allowances = Number(payrollData.allowance);
      if (payrollData.deduction !== undefined) payrollData.deductions = Number(payrollData.deduction);
      if (payrollData.net !== undefined) payrollData.netSalary = Number(payrollData.net);

      // Auto-calculate net if not provided
      const gross = (payrollData.baseSalary || 0) + (payrollData.allowances || 0);
      if (payrollData.netSalary === undefined || payrollData.netSalary === null) {
        payrollData.netSalary = Math.max(0, gross - (payrollData.deductions || 0));
      }

      // Validate status enum
      const VALID_PAYROLL_STATUSES = ['DRAFT', 'APPROVED', 'PAID', 'CANCELLED'];
      if (payrollData.status) {
        const upper = String(payrollData.status).toUpperCase();
        payrollData.status = VALID_PAYROLL_STATUSES.includes(upper) ? upper : 'DRAFT';
      } else {
        payrollData.status = 'DRAFT';
      }

      if (payrollData.paymentDate && typeof payrollData.paymentDate === 'string') {
        payrollData.paymentDate = new Date(payrollData.paymentDate);
      }

      // Strip non-schema fields
      delete payrollData.employee;
      delete payrollData.period;
      delete payrollData.basic;
      delete payrollData.allowance;
      delete payrollData.deduction;
      delete payrollData.net;
      delete payrollData.department;
      delete payrollData.prismaId;
      delete payrollData.remainingDays;
      delete payrollData.leaveBalances;
      delete payrollData.department;
      delete payrollData.companyId;

      return delegate.create({ data: payrollData });
    }

    // ── GENERAL LEDGER: create a manual JournalEntry ─────────────────
    if (pillarSlug === 'finance-accounting' && moduleSlug === 'general-ledger') {
      const entryDate = data.date
        ? (data.date instanceof Date ? data.date : new Date(data.date + (String(data.date).includes('T') ? '' : 'T00:00:00.000Z')))
        : new Date();
      return this.prisma.journalEntry.create({
        data: {
          companyId,
          date: entryDate,
          ref: data.ref || `JV-${Date.now()}`,
          account: data.account || '',
          description: data.description || '',
          debit: Number(data.debit) || 0,
          credit: Number(data.credit) || 0,
          status: data.status || 'Posted',
        },
      });
    }

    // ── ACCOUNTS PAYABLE / RECEIVABLE: Create invoice transparently ─────
    if (pillarSlug === 'finance-accounting' && (moduleSlug === 'accounts-payable' || moduleSlug === 'accounts-receivable')) {
      const isAP = moduleSlug === 'accounts-payable';
      const customerName = data.vendor || data.customer || 'Unknown';
      // Find or create customer by name
      let customer = await this.prisma.customer.findFirst({
        where: { companyId, name: { contains: customerName, mode: 'insensitive' } },
      });
      if (!customer) {
        customer = await this.prisma.customer.create({
          data: { name: customerName, company: customerName, type: 'BUSINESS', status: 'ACTIVE', source: 'Manual', companyId },
        });
      }
      const STATUS_MAP: Record<string, any> = { 'Pending': 'SENT', 'Overdue': 'OVERDUE', 'Outstanding': 'SENT', 'Draft': 'DRAFT', 'Paid': 'PAID', 'Cancelled': 'CANCELLED' };
      const invoiceData = {
        invoiceNo: data.invoiceNo || `${isAP ? 'AP' : 'AR'}-${Date.now().toString(36).toUpperCase()}`,
        customerId: customer.id,
        issueDate: (data.invoiceDate || data.issueDate) ? new Date(data.invoiceDate || data.issueDate) : new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subTotal: Number(data.amount || data.balance || 0),
        total: Number(data.amount || data.balance || 0),
        status: STATUS_MAP[data.status] || 'SENT',
        notes: data.notes || '',
      };
      return this.prisma.invoice.create({ data: { ...invoiceData, companyId } as any });
    }

    // ── INVOICE: create with line items ────────────────────────────────
    if ((pillarSlug === 'crm-sales' || pillarSlug === 'finance-accounting') && moduleSlug === 'invoicing') {
      const { items, amount, ...invoiceData } = data;
      const dateConverted = this.convertDateStrings(invoiceData);
      return delegate.create({
        data: {
          ...this.stripDisplayFields(dateConverted),
          companyId,
          items: items && items.length > 0
            ? { create: items.map((item: any) => ({
                description: item.description || '',
                quantity: Number(item.quantity) || 0,
                unitPrice: Number(item.unitPrice) || 0,
                total: Number(item.total) || 0,
              })) }
            : undefined,
        },
      });
    }

    // ── BATCH & SERIAL NUMBERS: map product/warehouse names → IDs ──
    if (pillarSlug === 'inventory-warehouse' && (moduleSlug === 'batch-serial-numbers' || moduleSlug === 'goods-receipt' || moduleSlug === 'stock-transfers' || moduleSlug === 'cycle-counts')) {
      const invData: Record<string, any> = { ...data };

      // Look up product by name or SKU
      if (invData.product && !invData.productId) {
        const searchTerm = String(invData.product).trim();
        const product = await this.prisma.product.findFirst({
          where: {
            companyId,
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { sku: { equals: searchTerm, mode: 'insensitive' } },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });
        if (product) {
          invData.productId = product.id;
        } else {
          throw new NotFoundException(`Product "${invData.product}" not found. Please create the product first.`);
        }
      }

      // Look up warehouse by name
      if (invData.warehouse && !invData.warehouseId) {
        const searchTerm = String(invData.warehouse).trim();
        const warehouse = await this.prisma.warehouse.findFirst({
          where: {
            companyId,
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { code: { equals: searchTerm, mode: 'insensitive' } },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });
        if (warehouse) {
          invData.warehouseId = warehouse.id;
        } else {
          throw new NotFoundException(`Warehouse "${invData.warehouse}" not found. Please create the warehouse first.`);
        }
      }

      // Strip display-only fields — also remove `sku` (it's a Product field, not on these models)
      const cleaned = this.stripDisplayFields(this.normalizeEnumFields(pillarSlug, moduleSlug, this.convertDateStrings(this.normalizeBooleanFields(invData))));
      delete (cleaned as any).sku;

      // For goods-receipt and stock-transfers: wrap in transaction to keep stock + movement in sync
      if ((moduleSlug === 'goods-receipt' || moduleSlug === 'stock-transfers') && cleaned.productId) {
        const quantityChange = cleaned.quantityChange || 0;
        
        // Use a Prisma transaction to ensure atomicity
        const [movement] = await this.prisma.$transaction(async (tx: any) => {
          // 1. Read current stock within the transaction
          const currentProduct = await tx.product.findUnique({
            where: { id: cleaned.productId },
            select: { stock: true },
          });
          const currentStock = currentProduct?.stock || 0;

          // 2. Compute balance fields
          cleaned.balanceBefore = currentStock;
          cleaned.balanceAfter = currentStock + quantityChange;

          // For stock-transfers: default type
          if (moduleSlug === 'stock-transfers' && !cleaned.type) {
            cleaned.type = 'TRANSFER_OUT';
          }

          // 3. Update product stock
          await tx.product.update({
            where: { id: cleaned.productId },
            data: { stock: currentStock + quantityChange },
          });

          // 4. Create the stock movement record
          return [await tx[delegate === this.prisma.stockMovement ? 'stockMovement' : 'productBatch'].create({
            data: { ...cleaned, companyId },
          })];
        });
        return movement;
      }

      // Validate that required foreign keys are present for inventory modules
      if (!cleaned.productId) {
        throw new BadRequestException(
          'Product is required. Please select or create a product first.'
        );
      }

      return delegate.create({ data: { ...cleaned, companyId } });
    }

        // ── BUDGETING: Strip status (display-only, not a DB field) ─────────
    if (pillarSlug === "finance-accounting" && moduleSlug === "budgeting") {
      const { status, ...budgetData } = data;
      return delegate.create({ data: { ...this.stripDisplayFields(this.normalizeEnumFields(pillarSlug, moduleSlug, this.convertDateStrings(this.normalizeBooleanFields(budgetData)))), companyId } });
    }


    // ══════════════════════════════════════════════════════════════════
    // PROCUREMENT: Map frontend field names to Prisma model fields
    // ══════════════════════════════════════════════════════════════════
    if (pillarSlug === 'procurement') {
      // Purchase Requests — map reqNo→purchaseNo, requester→supplierName, estCost→total
      if (moduleSlug === 'purchase-requests') {
        const { id, createdAt, updatedAt, item, qty, priority, ...rest } = data;
        return delegate.create({
          data: {
            purchaseNo: rest.reqNo || '',
            supplierName: rest.requester || '',
            total: Number(rest.estCost) || 0,
            status: rest.status === 'Pending' ? 'PENDING' : rest.status === 'Approved' ? 'ORDERED' : rest.status === 'Cancelled' ? 'CANCELLED' : 'PENDING',
            companyId,
          },
        });
      }
      // Vendor Management & Supplier Portal — map status→isActive
      if (moduleSlug === 'vendor-management' || moduleSlug === 'supplier-portal') {
        const { id, createdAt, updatedAt, source, value: _v, score, stage, ...rest } = data;
        return delegate.create({
          data: {
            name: rest.name || '',
            email: rest.email || '',
            phone: rest.phone || '',
            category: rest.category || '',
            rating: Number(rest.rating) || 0,
            isActive: rest.status === 'Active',
            companyId,
          },
        });
      }
      // RFQs — map vendor name to vendorId
      if (moduleSlug === 'rfqs') {
        const { id, createdAt, updatedAt, vendor, ...rest } = data;
        let vendorId;
        if (vendor && typeof vendor === 'string') {
          const found = await this.prisma.vendor.findFirst({ where: { name: { contains: vendor, mode: 'insensitive' }, companyId } });
          if (found) vendorId = found.id;
        }
        return delegate.create({
          data: {
            rfqNo: rest.rfqNo || '',
            title: rest.title || '',
            vendorId,
            dueDate: rest.dueDate ? new Date(rest.dueDate) : null,
            total: Number(rest.total) || 0,
            status: rest.status || 'Draft',
            companyId,
          },
        });
      }
      // Contract Management — map vendor name→vendorId, status→enum
      if (moduleSlug === 'contract-management') {
        const { id, createdAt, updatedAt, vendor, ...rest } = data;
        let vendorId;
        if (vendor && typeof vendor === 'string') {
          const found = await this.prisma.vendor.findFirst({ where: { name: { contains: vendor, mode: 'insensitive' }, companyId } });
          if (found) vendorId = found.id;
        }
        const statusMap = { 'Active': 'ACTIVE', 'Draft': 'DRAFT', 'Expired': 'EXPIRED', 'Terminated': 'TERMINATED' };
        return delegate.create({
          data: {
            title: rest.title || '',
            vendorId,
            value: Number(rest.value) || 0,
            startDate: rest.startDate ? new Date(rest.startDate) : null,
            endDate: rest.endDate ? new Date(rest.endDate) : null,
            status: statusMap[rest.status] || rest.status || 'DRAFT',
            companyId,
          },
        });
      }
      // Approval Workflow
      if (moduleSlug === 'approval-workflow') {
        const { id, createdAt, updatedAt, ...rest } = data;
        return delegate.create({ data: { requestNo: rest.requestNo || '', module: rest.module || '', requestedBy: rest.requestedBy || '', approver: rest.approver || '', status: rest.status || 'Pending', companyId } });
      }
      // Tender Management
      if (moduleSlug === 'tender-management') {
        const { id, createdAt, updatedAt, ...rest } = data;
        return delegate.create({
          data: {
            tenderNo: rest.tenderNo || '',
            title: rest.title || '',
            department: rest.department || '',
            issueDate: rest.issueDate ? new Date(rest.issueDate) : null,
            closingDate: rest.closingDate ? new Date(rest.closingDate) : null,
            budget: Number(rest.budget) || 0,
            status: rest.status || 'Open',
            companyId,
          },
        });
      }
    }


    // ══════════════════════════════════════════════════════════════════
    // MANUFACTURING: Map frontend field names to Prisma model fields
    // ══════════════════════════════════════════════════════════════════
    if (pillarSlug === 'manufacturing') {
      // Work Orders & Production Planning
      if (moduleSlug === 'work-orders' || moduleSlug === 'production-planning') {
        const { id, createdAt, updatedAt, planNo, qty, product, ...rest } = data;
        const statusMap: Record<string, string> = { 'Planned': 'PLANNED', 'In Production': 'IN_PRODUCTION', 'Quality Check': 'QUALITY_CHECK', 'Completed': 'COMPLETED', 'Cancelled': 'CANCELLED' };
        return delegate.create({ data: { orderNumber: rest.orderNumber || rest.planNo || '', productId: rest.product || rest.productId || '', quantity: Number(rest.quantity || rest.qty || 0), status: statusMap[rest.status] || 'PLANNED', startDate: rest.startDate ? new Date(rest.startDate) : null, endDate: rest.endDate ? new Date(rest.endDate) : null, companyId } });
      }
      // Machine Monitoring
      if (moduleSlug === 'machine-monitoring') {
        const { id, createdAt, updatedAt, ...rest } = data;
        const statusMap: Record<string, string> = { 'Operational': 'OPERATIONAL', 'Idle': 'IDLE', 'Maintenance': 'MAINTENANCE', 'Offline': 'OFFLINE' };
        return delegate.create({ data: { machineNo: rest.machineNo || '', name: rest.name || '', model: rest.model || '', status: statusMap[rest.status] || 'OPERATIONAL', location: rest.location || '', utilization: Number(rest.utilization) || 0, companyId } });
      }
      // Maintenance
      if (moduleSlug === 'maintenance') {
        const { id, createdAt, updatedAt, machine, ...rest } = data;
        let machineId;
        if (machine && typeof machine === 'string') {
          const found = await this.prisma.machine.findFirst({ where: { name: { contains: machine, mode: 'insensitive' }, companyId } });
          if (found) machineId = found.id;
        }
        const typeMap: Record<string, string> = { 'Preventive': 'PREVENTIVE', 'Corrective': 'CORRECTIVE', 'Emergency': 'EMERGENCY', 'Scheduled': 'SCHEDULED' };
        const statusMap: Record<string, string> = { 'Planned': 'PLANNED', 'In Progress': 'IN_PROGRESS', 'Completed': 'COMPLETED', 'Cancelled': 'CANCELLED' };
        return delegate.create({ data: { recordNo: rest.recordNo || '', title: rest.title || '', machineId, type: typeMap[rest.type] || 'PREVENTIVE', scheduledDate: rest.scheduledDate ? new Date(rest.scheduledDate) : null, cost: Number(rest.cost) || 0, status: statusMap[rest.status] || 'PLANNED', companyId } });
      }
      // Quality Control
      if (moduleSlug === 'quality-control') {
        const { id, createdAt, updatedAt, ...rest } = data;
        const resultMap: Record<string, string> = { 'Pass': 'PASS', 'Fail': 'FAIL', 'Pending': 'PENDING', 'Rework': 'REWORK' };
        return delegate.create({ data: { checkNo: rest.checkNo || '', productId: rest.product || '', inspector: rest.inspector || '', result: resultMap[rest.result] || 'PENDING', notes: rest.notes || '', checkedAt: rest.checkedAt ? new Date(rest.checkedAt) : new Date(), companyId } });
      }
      // Production Scheduling
      if (moduleSlug === 'production-scheduling') {
        const { id, createdAt, updatedAt, workOrder, machine, ...rest } = data;
        let machineId;
        if (machine && typeof machine === 'string') {
          const found = await this.prisma.machine.findFirst({ where: { name: { contains: machine, mode: 'insensitive' }, companyId } });
          if (found) machineId = found.id;
        }
        return delegate.create({ data: { scheduleNo: rest.scheduleNo || '', workOrderId: rest.workOrder || workOrder || '', machineId, priority: rest.priority || 'MEDIUM', startDate: rest.startDate ? new Date(rest.startDate) : null, endDate: rest.endDate ? new Date(rest.endDate) : null, status: rest.status || 'SCHEDULED', companyId } });
      }
      // Bills of Materials
      if (moduleSlug === 'bills-of-materials-bom') {
        const { id, createdAt, updatedAt, product, itemsCount, ...rest } = data;
        return delegate.create({ data: { name: rest.name || '', productId: rest.product || '', version: rest.version || '1.0', totalCost: Number(rest.totalCost) || 0, status: rest.status || 'ACTIVE', companyId } });
      }
    }
        const cleaned = this.stripDisplayFields(this.normalizeEnumFields(pillarSlug, moduleSlug, this.convertDateStrings(this.normalizeBooleanFields(this.parseDocSize(data, pillarSlug)))));
    // Strip computed display fields specific to document management
    if (pillarSlug === "document-management") {
      delete cleaned.name;
      delete cleaned.type;
      delete cleaned.modified;
      // Only Document and DocumentVersion have a 'size' field
      if (delegate !== this.prisma.document && delegate !== this.prisma.documentVersion) {
        delete cleaned.size;
      }
      // DigitalSignature has document as a relation field (documentId), not a string
      if (delegate === this.prisma.digitalSignature) {
        delete cleaned.document;
      }
    }
    return delegate.create({ data: { ...cleaned, companyId } });
  }

  /**
   * Normalises enum fields to valid Prisma enum values.
   * If a value doesn't match the enum, it's auto-corrected to the default.
   * Prevents "Invalid value for argument" Prisma errors.
   */
  private normalizeEnumFields(pillarSlug: string, moduleSlug: string, data: Record<string, any>): Record<string, any> {
    // ── All Prisma enums with their valid values and defaults ────────────
    const ENUMS: Record<string, { valid: Set<string>; default: string }> = {
      // CRM & Sales
      DealStage: { valid: new Set(['PROSPECTING','QUALIFICATION','PROPOSAL','NEGOTIATION','CLOSED_WON','CLOSED_LOST']), default: 'PROSPECTING' },
      InvoiceStatus: { valid: new Set(['DRAFT','SENT','PAID','OVERDUE','CANCELLED']), default: 'DRAFT' },
      ContractStatus: { valid: new Set(['DRAFT','ACTIVE','EXPIRED','TERMINATED']), default: 'DRAFT' },
      CustomerType: { valid: new Set(['INDIVIDUAL','BUSINESS']), default: 'INDIVIDUAL' },
      CustomerStatus: { valid: new Set(['ACTIVE','INACTIVE','PROSPECT']), default: 'ACTIVE' },
      LeadSource: { valid: new Set(['WEBSITE','REFERRAL','SOCIAL_MEDIA','COLD_CALL','EMAIL_CAMPAIGN','OTHER']), default: 'OTHER' },
      LeadStatus: { valid: new Set(['NEW','CONTACTED','QUALIFIED','PROPOSAL','NEGOTIATION','CLOSED_WON','CLOSED_LOST']), default: 'NEW' },

      // Inventory & Procurement
      PurchaseStatus: { valid: new Set(['PENDING','ORDERED','RECEIVED','CANCELLED']), default: 'PENDING' },

      // Finance
      ExpenseStatus: { valid: new Set(['PENDING','APPROVED','REJECTED','REIMBURSED']), default: 'PENDING' },

      // Projects
      ProjectStatus: { valid: new Set(['PLANNING','IN_PROGRESS','ON_HOLD','COMPLETED','CANCELLED']), default: 'PLANNING' },

      // Marketing
      CampaignType: { valid: new Set(['EMAIL','SMS','SOCIAL_MEDIA','PUSH','WHATSAPP']), default: 'EMAIL' },
      CampaignStatus: { valid: new Set(['DRAFT','SCHEDULED','SENT','PAUSED','CANCELLED']), default: 'DRAFT' },

      // Logistics
      VehicleStatus: { valid: new Set(['AVAILABLE','IN_USE','MAINTENANCE','RETIRED']), default: 'AVAILABLE' },

      // Manufacturing
      WorkOrderStatus: { valid: new Set(['PLANNED','IN_PRODUCTION','QUALITY_CHECK','COMPLETED','CANCELLED']), default: 'PLANNED' },

      // HR
      Gender: { valid: new Set(['MALE','FEMALE','OTHER','UNSPECIFIED']), default: 'UNSPECIFIED' },
      MaritalStatus: { valid: new Set(['SINGLE','MARRIED','DIVORCED','WIDOWED','SEPARATED']), default: 'SINGLE' },
      SalaryType: { valid: new Set(['MONTHLY','DAILY','HOURLY']), default: 'MONTHLY' },
      EmploymentType: { valid: new Set(['FULL_TIME','PART_TIME','CONTRACT','INTERN']), default: 'FULL_TIME' },
      EmployeeStatus: { valid: new Set(['ACTIVE','INACTIVE','TERMINATED','ON_LEAVE']), default: 'ACTIVE' },
      AttendanceStatus: { valid: new Set(['PRESENT','ABSENT','LATE','HALF_DAY','HOLIDAY','ON_LEAVE','ON_BUSINESS_TRIP','REMOTE']), default: 'PRESENT' },
      LeaveType: { valid: new Set(['ANNUAL','SICK','MATERNITY','PATERNITY','UNPAID','OTHER']), default: 'OTHER' },
      LeaveStatus: { valid: new Set(['PENDING','APPROVED','REJECTED','CANCELLED']), default: 'PENDING' },
      PayrollStatus: { valid: new Set(['DRAFT','APPROVED','PAID','CANCELLED']), default: 'DRAFT' },
    };

    // ── Map each module to its enum fields ───────────────────────────────
    // Some fields like 'status', 'type', 'stage' have different enums per model.
    const MODULE_ENUM_MAP: Record<string, Array<{ field: string; enumType: string }>> = {
      'crm-sales::invoicing':              [{ field: 'status', enumType: 'InvoiceStatus' }],
      'finance-accounting::invoicing':     [{ field: 'status', enumType: 'InvoiceStatus' }],
      'crm-sales::opportunity-pipeline':   [{ field: 'stage', enumType: 'DealStage' }],
      'crm-sales::lead-management':        [{ field: 'source', enumType: 'LeadSource' }, { field: 'status', enumType: 'LeadStatus' }],
      'crm-sales::customer-management':    [{ field: 'type', enumType: 'CustomerType' }, { field: 'status', enumType: 'CustomerStatus' }],
      'crm-sales::contact-management':     [{ field: 'type', enumType: 'CustomerType' }, { field: 'status', enumType: 'CustomerStatus' }],
      'crm-sales::contracts':              [{ field: 'status', enumType: 'ContractStatus' }],
      'procurement::contract-management':  [{ field: 'status', enumType: 'ContractStatus' }],
      'inventory-warehouse::purchase-orders': [{ field: 'status', enumType: 'PurchaseStatus' }],
      'finance-accounting::expenses':      [{ field: 'status', enumType: 'ExpenseStatus' }],
      'project-management::projects':      [{ field: 'status', enumType: 'ProjectStatus' }],
      'marketing::campaigns':              [{ field: 'type', enumType: 'CampaignType' }, { field: 'status', enumType: 'CampaignStatus' }],
      'human-resources::attendance':       [{ field: 'status', enumType: 'AttendanceStatus' }],
      'logistics-fleet::vehicles':         [{ field: 'status', enumType: 'VehicleStatus' }],
    };

    const result = { ...data };
    const key = `${pillarSlug}::${moduleSlug}`;
    const fieldMappings = MODULE_ENUM_MAP[key] || [];

    for (const { field, enumType } of fieldMappings) {
      if (result[field] === undefined || result[field] === null || result[field] === '') continue;

      const enumInfo = ENUMS[enumType];
      if (!enumInfo) continue;

      const upper = String(result[field]).toUpperCase().trim();

      // Also try matching display labels like "Closed Won" → "CLOSED_WON"
      const displayToUpper = upper.replace(/\s+/g, '_');

      if (enumInfo.valid.has(upper)) {
        result[field] = upper;
      } else if (enumInfo.valid.has(displayToUpper)) {
        result[field] = displayToUpper;
      } else {
        // Auto-correct invalid values to the default
        result[field] = enumInfo.default;
      }
    }

    return result;
  }

  /**
   * Strips display-only / computed fields that don't exist in Prisma models.
   * Prevents "Unknown argument" Prisma errors from frontend-only fields.
   */
  private stripDisplayFields(data: Record<string, any>): Record<string, any> {
    const DISPLAY_ONLY_FIELDS = new Set([
      // ── Relation display names (Prisma has *Id variants) ──────────
      'vendor', 'customer', 'deal', 'employee', 'manager', 
      'product', 'warehouse', 'companyRef',
      // ── Invoice UI-only fields ───────────────────────────────────
      'discountPercent', 'discountAmount', 'amountPaid', 'balanceDue',
      'termsAndConditions', 'taxRate', 'customerEmail', 'customerPhone',
      'paid',
      // ── Frontend computed / aliases ──────────────────────────────
      'prismaId', 'remainingDays', 'leaveBalances', 'isLate',
      'basic', 'allowance', 'deduction', 'net', 'period', 'monthName',
      // ── These are NOT stripped because they ARE valid Prisma fields:
      // stage (Deal), source (Customer/Lead), type (Customer/Leave/etc)
    ]);
    const result = { ...data };
    for (const field of DISPLAY_ONLY_FIELDS) {
      delete result[field];
    }
    return result;
  }

  /**
   * Normalises string boolean values ("Active", "Inactive", "true", "false", "Yes", "No")
   * to actual JavaScript booleans before passing to Prisma.
   * Prevents "Expected Boolean, provided String" errors.
   */
  private normalizeBooleanFields(data: Record<string, any>): Record<string, any> {
    // ── Known boolean field names across all models ──────────
    const BOOLEAN_FIELDS = new Set([
      'isActive', 'isLate', 'earlyDeparture', 'biometricVerified',
      'graduated', 'isExpired', 'rehireable',
    ]);

    const result = { ...data };

    for (const field of BOOLEAN_FIELDS) {
      if (result[field] === undefined || result[field] === null) continue;

      const val = String(result[field]).toLowerCase().trim();
      if (val === 'active' || val === 'true' || val === 'yes' || val === '1') {
        result[field] = true;
      } else {
        // Everything else (inactive, false, no, 0, under maintenance, etc.) → false
        result[field] = false;
      }
    }

    return result;
  }

  /**
   * Helper to convert date-only strings (YYYY-MM-DD) to Date objects
   * Used by generic createData and updateData fallbacks.
   */
  private convertDateStrings(data: Record<string, any>): Record<string, any> {
    const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
    const result: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      if (typeof val === 'string' && DATE_PATTERN.test(val)) {
        result[key] = new Date(val + 'T00:00:00.000Z');
      } else {
        result[key] = val;
      }
    }
    return result;
  }

  async updateData(pillarSlug: string, moduleSlug: string, id: string, companyId: string, data: any): Promise<any> {
    const delegate = this.getModelDelegate(pillarSlug, moduleSlug) as any;
    if (!delegate) return { message: `Record updated (mock: ${moduleSlug})`, data };
    
    // Remove the id and companyId so we don't accidentally update them
    delete data.id;
    delete data.companyId;

    // ── GENERAL LEDGER: update a manual JournalEntry ─────────────────
    if (pillarSlug === 'finance-accounting' && moduleSlug === 'general-ledger') {
      const entryDate = data.date
        ? (data.date instanceof Date ? data.date : new Date(data.date + (String(data.date).includes('T') ? '' : 'T00:00:00.000Z')))
        : undefined;
      return this.prisma.journalEntry.update({
        where: { id },
        data: {
          ...(entryDate && { date: entryDate }),
          ...(data.ref !== undefined && { ref: data.ref }),
          ...(data.account !== undefined && { account: data.account }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.debit !== undefined && { debit: Number(data.debit) }),
          ...(data.credit !== undefined && { credit: Number(data.credit) }),
          ...(data.status !== undefined && { status: data.status }),
        },
      });
    }

    if (pillarSlug === 'human-resources' && moduleSlug === 'employee-management') {
      const { educations, certifications, children, empDocuments, experiences, skills, user, ...rawData } = data;
      delete rawData.userId;

      const EMPLOYEE_FIELDS = new Set([
        'employeeCode','firstName','middleName','lastName','preferredName','dateOfBirth','gender',
        'nationality','ethnicity','religion','maritalStatus','bloodType','profilePhoto',
        'personalEmail','workEmail','personalPhone','workPhone','address','city','region','country','postalCode',
        'nationalId','nationalIdExpiry','passportNumber','passportExpiry',
        'driverLicenseNumber','driverLicenseClass','driverLicenseExpiry',
        'tinNumber','pensionId','workPermit','workPermitExpiry','visaStatus',
        'jobTitle','employmentType','status','hireDate','probationEndDate','confirmationDate',
        'terminationDate','terminationReason','noticePeriodDays','contractType','contractEndDate',
        'workLocation','workShift','branchOffice','gradeLevel','costCenter',
        'salary','salaryType','currency','allowances','bankName','bankAccount','bankBranch',
        'taxId','taxBracket','pensionContribution','paymentMethod','accountHolderName','bonuses',
        'disabilityStatus','medicalConditions','emergencyMedical','vaccinationStatus','medicalInsurance','medicalInsuranceNo',
        'emergencyName','emergencyRelation','emergencyPhone','emergencyEmail',
        'annualLeaveBalance','sickLeaveBalance','maternityLeave','paternityLeave',
        'unpaidLeaveBalance','compassionateLeave','otherLeaveTypes',
        'departmentId','managerId',
      ]);
      const DATE_FIELDS = new Set(['dateOfBirth','nationalIdExpiry','passportExpiry','driverLicenseExpiry','workPermitExpiry','hireDate','probationEndDate','confirmationDate','terminationDate','contractEndDate']);
      const FLOAT_FIELDS = new Set(['salary','allowances','pensionContribution','bonuses','annualLeaveBalance','sickLeaveBalance','maternityLeave','paternityLeave','unpaidLeaveBalance','compassionateLeave']);

      // Normalize enum fields (same maps as createData)
      const GENDER_MAP: Record<string, string> = {
        male: 'MALE', female: 'FEMALE', other: 'OTHER', unspecified: 'UNSPECIFIED',
        m: 'MALE', f: 'FEMALE',
      };
      const MARITAL_MAP: Record<string, string> = {
        single: 'SINGLE', married: 'MARRIED', divorced: 'DIVORCED',
        widowed: 'WIDOWED', separated: 'SEPARATED',
      };
      const EMPLOYMENT_MAP: Record<string, string> = {
        full_time: 'FULL_TIME', 'full time': 'FULL_TIME', fulltime: 'FULL_TIME',
        part_time: 'PART_TIME', 'part time': 'PART_TIME', parttime: 'PART_TIME',
        contract: 'CONTRACT', intern: 'INTERN', freelance: 'FREELANCE',
      };
      const STATUS_MAP: Record<string, any> = {
        active: 'ACTIVE', inactive: 'INACTIVE', on_leave: 'ON_LEAVE',
        terminated: 'TERMINATED', probation: 'PROBATION', suspended: 'SUSPENDED',
      };
      const SALARY_MAP: Record<string, string> = {
        monthly: 'MONTHLY', daily: 'DAILY', hourly: 'HOURLY',
      };

      const employeeData: Record<string, any> = {};
      for (const [key, val] of Object.entries(rawData)) {
        if (!EMPLOYEE_FIELDS.has(key)) continue;
        if (DATE_FIELDS.has(key)) {
          employeeData[key] = val && val !== '' ? new Date(val as string) : null;
        } else if (FLOAT_FIELDS.has(key)) {
          employeeData[key] = val !== '' && val !== null && val !== undefined ? Number(val) : 0;
        } else {
          employeeData[key] = val === '' ? null : val;
        }
      }

      // Apply enum normalization
      if (employeeData.gender) {
        employeeData.gender = GENDER_MAP[(employeeData.gender as string).toLowerCase()] ?? 'UNSPECIFIED';
      }
      if (employeeData.maritalStatus) {
        employeeData.maritalStatus = MARITAL_MAP[(employeeData.maritalStatus as string).toLowerCase()] ?? 'SINGLE';
      }
      if (employeeData.employmentType) {
        employeeData.employmentType = EMPLOYMENT_MAP[(employeeData.employmentType as string).toLowerCase()] ?? 'FULL_TIME';
      }
      if (employeeData.status) {
        employeeData.status = STATUS_MAP[(employeeData.status as string).toLowerCase()] ?? 'ACTIVE';
      }
      if (employeeData.salaryType) {
        employeeData.salaryType = SALARY_MAP[(employeeData.salaryType as string).toLowerCase()] ?? 'MONTHLY';
      }

      const cleanEducations = (educations || []).map(({ certificateFileName, ...e }: any) => e);
      const cleanExperiences = (experiences || []).map(({ referenceFileName, ...e }: any) => e);

      return delegate.update({
        where: { id, companyId },
        data: {
          ...employeeData,
          ...(educations    && { educations:     { deleteMany: {}, create: cleanEducations } }),
          ...(certifications && { certifications: { deleteMany: {}, create: certifications } }),
          ...(children      && { children:        { deleteMany: {}, create: children } }),
          ...(empDocuments  && { empDocuments:    { deleteMany: {}, create: empDocuments } }),
          ...(experiences   && { experiences:     { deleteMany: {}, create: cleanExperiences } }),
          ...(skills        && { skills:          { deleteMany: {}, create: skills } }),
        },
      });
    }

    // ── LEAVE MANAGEMENT UPDATE: map employee name → employeeId, validate fields ──
    if (pillarSlug === 'human-resources' && moduleSlug === 'leave-management') {
      delete data.id;
      // Map employee name to employeeId
      if (data.employee && typeof data.employee === 'string') {
        const searchTerm = data.employee.trim();
        const nameParts = searchTerm.split(/\s+/);
        const where: any[] = [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { employeeCode: { equals: searchTerm, mode: 'insensitive' } },
        ];
        if (nameParts.length >= 2) {
          where.push({
            firstName: { contains: nameParts[0], mode: 'insensitive' },
            lastName: { contains: nameParts.slice(1).join(' '), mode: 'insensitive' },
          });
        }
        const employee = await this.prisma.employee.findFirst({
          where: { companyId, OR: where },
          orderBy: { createdAt: 'desc' },
        });
        if (employee) {
          data.employeeId = employee.id;
        } else {
          throw new NotFoundException(`Employee "${data.employee}" not found`);
        }
        delete data.employee;
      } else if (data.employeeId) {
        delete data.employee;
      }
      // Validate & normalize date fields
      if (data.startDate) data.startDate = new Date(data.startDate);
      if (data.endDate) data.endDate = new Date(data.endDate);
      // Validate leave type enum
      const VALID_TYPES = ['ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'UNPAID', 'OTHER'];
      if (data.type) {
        const upper = String(data.type).toUpperCase();
        data.type = VALID_TYPES.includes(upper) ? upper : 'OTHER';
      }
      // Validate leave status enum
      const VALID_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
      if (data.status) {
        const upper = String(data.status).toUpperCase();
        data.status = VALID_STATUSES.includes(upper) ? upper : 'PENDING';
      }
      // Strip any non-schema fields
      delete data.days;
    }

    // ── ACCOUNTS PAYABLE / RECEIVABLE: Update invoice transparently ─────
    if (pillarSlug === "finance-accounting" && (moduleSlug === "accounts-payable" || moduleSlug === "accounts-receivable")) {
      const STATUS_MAP = { "Pending": "SENT", "Overdue": "OVERDUE", "Outstanding": "SENT", "Draft": "DRAFT", "Paid": "PAID", "Cancelled": "CANCELLED" };
      const updateData: Record<string, any> = {};
      if (data.vendor || data.customer) {
        const customerName = data.vendor || data.customer;
        let customer = await this.prisma.customer.findFirst({
          where: { companyId, name: { contains: customerName, mode: "insensitive" } },
        });
        if (!customer) {
          customer = await this.prisma.customer.create({
            data: { name: customerName, company: customerName, type: "BUSINESS", status: "ACTIVE", source: "Manual", companyId },
          });
        }
        updateData.customerId = customer.id;
      }
      if (data.invoiceDate || data.issueDate) updateData.issueDate = new Date(data.invoiceDate || data.issueDate);
      if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
      if (data.amount !== undefined || data.balance !== undefined) {
        updateData.subTotal = Number(data.amount || data.balance || 0);
        updateData.total = Number(data.amount || data.balance || 0);
      }
      if (data.status) updateData.status = STATUS_MAP[data.status] || "SENT";
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.invoiceNo) updateData.invoiceNo = data.invoiceNo;
      return this.prisma.invoice.update({ where: { id }, data: updateData as any });
    }

    // ── INVOICE UPDATE: replace line items ──────────────────────────────
    if ((pillarSlug === 'crm-sales' || pillarSlug === 'finance-accounting') && moduleSlug === 'invoicing') {
      const { items, ...invoiceData } = data;
      const cleaned = this.stripDisplayFields(this.convertDateStrings(invoiceData));
      delete cleaned.id;
      delete cleaned.companyId;
      // Ensure the invoice belongs to this company
      const existing = await this.prisma.invoice.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Invoice not found');

      return delegate.update({
        where: { id },
        data: {
          ...cleaned,
          items: {
            deleteMany: {},
            create: items && items.length > 0
              ? items.map((item: any) => ({
                  description: item.description || '',
                  quantity: Number(item.quantity) || 0,
                  unitPrice: Number(item.unitPrice) || 0,
                  total: Number(item.total) || 0,
                }))
              : [],
          },
        },
      });
    }

    // ── PAYROLL UPDATE: map frontend keys → Prisma model fields ──
    if (pillarSlug === 'human-resources' && moduleSlug === 'payroll') {
      const payrollData: Record<string, any> = { ...data };

      delete payrollData.id;
      delete payrollData.employee; // employee is display-only, don't try to save

      // Map frontend fields to Prisma fields
      if (payrollData.basic !== undefined) { payrollData.baseSalary = Number(payrollData.basic); delete payrollData.basic; }
      if (payrollData.allowance !== undefined) { payrollData.allowances = Number(payrollData.allowance); delete payrollData.allowance; }
      if (payrollData.deduction !== undefined) { payrollData.deductions = Number(payrollData.deduction); delete payrollData.deduction; }
      if (payrollData.net !== undefined) { payrollData.netSalary = Number(payrollData.net); delete payrollData.net; }

      // Remove other frontend-only fields
      delete payrollData.period;
      delete payrollData.prismaId;
      delete payrollData.remainingDays;
      delete payrollData.leaveBalances;

      // Validate status
      if (payrollData.status) {
        const upper = String(payrollData.status).toUpperCase();
        const VALID = ['DRAFT', 'APPROVED', 'PAID', 'CANCELLED'];
        payrollData.status = VALID.includes(upper) ? upper : 'DRAFT';
      }

      if (payrollData.paymentDate && typeof payrollData.paymentDate === 'string') {
        payrollData.paymentDate = new Date(payrollData.paymentDate);
      }

      // Payroll doesn't have a direct companyId field — linked through employee
      try {
        return await delegate.update({ where: { id }, data: payrollData });
      } catch {
        return delegate.update({ where: { id, companyId }, data: payrollData });
      }
    }


    // ══════════════════════════════════════════════════════════════════
    // PROCUREMENT UPDATE: Map frontend field names to Prisma model fields
    // ══════════════════════════════════════════════════════════════════
    if (pillarSlug === 'procurement') {
      // Purchase Requests
      if (moduleSlug === 'purchase-requests') {
        const { id: _id, createdAt, updatedAt, item, qty, priority, ...rest } = data;
        const mapped: Record<string, any> = {};
        if (rest.reqNo !== undefined) mapped.purchaseNo = rest.reqNo;
        if (rest.requester !== undefined) mapped.supplierName = rest.requester;
        if (rest.estCost !== undefined) mapped.total = Number(rest.estCost);
        if (rest.status !== undefined) mapped.status = rest.status === 'Pending' ? 'PENDING' : rest.status === 'Approved' ? 'ORDERED' : rest.status === 'Cancelled' ? 'CANCELLED' : 'PENDING';
        try { return await delegate.update({ where: { id, companyId }, data: mapped }); } catch { return delegate.update({ where: { id }, data: mapped }); }
      }
      // Vendor Management & Supplier Portal
      if (moduleSlug === 'vendor-management' || moduleSlug === 'supplier-portal') {
        const { id: _id, createdAt, updatedAt, source, value: _v, score, stage, ...rest } = data;
        const mapped: Record<string, any> = {};
        if (rest.name !== undefined) mapped.name = rest.name;
        if (rest.email !== undefined) mapped.email = rest.email;
        if (rest.phone !== undefined) mapped.phone = rest.phone;
        if (rest.category !== undefined) mapped.category = rest.category;
        if (rest.rating !== undefined) mapped.rating = Number(rest.rating);
        if (rest.status !== undefined) mapped.isActive = rest.status === 'Active';
        try { return await delegate.update({ where: { id, companyId }, data: mapped }); } catch { return delegate.update({ where: { id }, data: mapped }); }
      }
      // RFQs
      if (moduleSlug === 'rfqs') {
        const { id: _id, createdAt, updatedAt, vendor, ...rest } = data;
        const mapped: Record<string, any> = {};
        if (rest.rfqNo !== undefined) mapped.rfqNo = rest.rfqNo;
        if (rest.title !== undefined) mapped.title = rest.title;
        if (vendor && typeof vendor === 'string') {
          const found = await this.prisma.vendor.findFirst({ where: { name: { contains: vendor, mode: 'insensitive' }, companyId } });
          if (found) mapped.vendorId = found.id;
        }
        if (rest.dueDate !== undefined) mapped.dueDate = new Date(rest.dueDate);
        if (rest.total !== undefined) mapped.total = Number(rest.total);
        if (rest.status !== undefined) mapped.status = rest.status;
        try { return await delegate.update({ where: { id, companyId }, data: mapped }); } catch { return delegate.update({ where: { id }, data: mapped }); }
      }
      // Contract Management
      if (moduleSlug === 'contract-management') {
        const { id: _id, createdAt, updatedAt, vendor, ...rest } = data;
        const mapped: Record<string, any> = {};
        if (rest.title !== undefined) mapped.title = rest.title;
        if (vendor && typeof vendor === 'string') {
          const found = await this.prisma.vendor.findFirst({ where: { name: { contains: vendor, mode: 'insensitive' }, companyId } });
          if (found) mapped.vendorId = found.id;
        }
        if (rest.value !== undefined) mapped.value = Number(rest.value);
        if (rest.startDate !== undefined) mapped.startDate = new Date(rest.startDate);
        if (rest.endDate !== undefined) mapped.endDate = new Date(rest.endDate);
        if (rest.status !== undefined) {
          const statusMap: Record<string, string> = { 'Active': 'ACTIVE', 'Draft': 'DRAFT', 'Expired': 'EXPIRED', 'Terminated': 'TERMINATED' };
          mapped.status = statusMap[rest.status] || rest.status;
        }
        try { return await delegate.update({ where: { id, companyId }, data: mapped }); } catch { return delegate.update({ where: { id }, data: mapped }); }
      }
      // Approval Workflow
      if (moduleSlug === 'approval-workflow') {
        const { id: _id, createdAt, updatedAt, ...rest } = data;
        const mapped: Record<string, any> = {};
        if (rest.requestNo !== undefined) mapped.requestNo = rest.requestNo;
        if (rest.module !== undefined) mapped.module = rest.module;
        if (rest.requestedBy !== undefined) mapped.requestedBy = rest.requestedBy;
        if (rest.approver !== undefined) mapped.approver = rest.approver;
        if (rest.status !== undefined) mapped.status = rest.status;
        try { return await delegate.update({ where: { id, companyId }, data: mapped }); } catch { return delegate.update({ where: { id }, data: mapped }); }
      }
      // Tender Management
      if (moduleSlug === 'tender-management') {
        const { id: _id, createdAt, updatedAt, ...rest } = data;
        const mapped: Record<string, any> = {};
        if (rest.tenderNo !== undefined) mapped.tenderNo = rest.tenderNo;
        if (rest.title !== undefined) mapped.title = rest.title;
        if (rest.department !== undefined) mapped.department = rest.department;
        if (rest.issueDate !== undefined) mapped.issueDate = new Date(rest.issueDate);
        if (rest.closingDate !== undefined) mapped.closingDate = new Date(rest.closingDate);
        if (rest.budget !== undefined) mapped.budget = Number(rest.budget);
        if (rest.status !== undefined) mapped.status = rest.status;
        try { return await delegate.update({ where: { id, companyId }, data: mapped }); } catch { return delegate.update({ where: { id }, data: mapped }); }
      }
    }


    // ══════════════════════════════════════════════════════════════════
    // MANUFACTURING UPDATE: Map frontend field names to Prisma model fields
    // ══════════════════════════════════════════════════════════════════
    if (pillarSlug === 'manufacturing') {
      // Work Orders & Production Planning
      if (moduleSlug === 'work-orders' || moduleSlug === 'production-planning') {
        const { id: _id, createdAt, updatedAt, planNo, qty, product, ...rest } = data;
        const mapped: Record<string, any> = {};
        if (rest.orderNumber !== undefined) mapped.orderNumber = rest.orderNumber;
        if (rest.product !== undefined) mapped.productId = rest.product;
        if (rest.quantity !== undefined) mapped.quantity = Number(rest.quantity);
        if (rest.qty !== undefined) mapped.quantity = Number(rest.qty);
        if (rest.startDate !== undefined) mapped.startDate = new Date(rest.startDate);
        if (rest.endDate !== undefined) mapped.endDate = new Date(rest.endDate);
        if (rest.status !== undefined) mapped.status = rest.status === 'Planned' ? 'PLANNED' : rest.status === 'In Production' ? 'IN_PRODUCTION' : rest.status === 'Quality Check' ? 'QUALITY_CHECK' : rest.status === 'Completed' ? 'COMPLETED' : 'CANCELLED';
        try { return await delegate.update({ where: { id, companyId }, data: mapped }); } catch { return delegate.update({ where: { id }, data: mapped }); }
      }
      // Machine Monitoring
      if (moduleSlug === 'machine-monitoring') {
        const { id: _id, createdAt, updatedAt, ...rest } = data;
        const mapped: Record<string, any> = {};
        if (rest.machineNo !== undefined) mapped.machineNo = rest.machineNo;
        if (rest.name !== undefined) mapped.name = rest.name;
        if (rest.model !== undefined) mapped.model = rest.model;
        if (rest.location !== undefined) mapped.location = rest.location;
        if (rest.utilization !== undefined) mapped.utilization = Number(rest.utilization);
        if (rest.status !== undefined) mapped.status = rest.status === 'Operational' ? 'OPERATIONAL' : rest.status === 'Idle' ? 'IDLE' : rest.status === 'Maintenance' ? 'MAINTENANCE' : 'OFFLINE';
        try { return await delegate.update({ where: { id, companyId }, data: mapped }); } catch { return delegate.update({ where: { id }, data: mapped }); }
      }
      // Maintenance
      if (moduleSlug === 'maintenance') {
        const { id: _id, createdAt, updatedAt, machine, ...rest } = data;
        const mapped: Record<string, any> = {};
        if (rest.recordNo !== undefined) mapped.recordNo = rest.recordNo;
        if (rest.title !== undefined) mapped.title = rest.title;
        if (machine) {
          const found = await this.prisma.machine.findFirst({ where: { name: { contains: machine, mode: 'insensitive' }, companyId } });
          if (found) mapped.machineId = found.id;
        }
        if (rest.type !== undefined) mapped.type = rest.type === 'Preventive' ? 'PREVENTIVE' : rest.type === 'Corrective' ? 'CORRECTIVE' : rest.type === 'Emergency' ? 'EMERGENCY' : 'SCHEDULED';
        if (rest.scheduledDate !== undefined) mapped.scheduledDate = new Date(rest.scheduledDate);
        if (rest.cost !== undefined) mapped.cost = Number(rest.cost);
        if (rest.status !== undefined) mapped.status = rest.status === 'Planned' ? 'PLANNED' : rest.status === 'In Progress' ? 'IN_PROGRESS' : rest.status === 'Completed' ? 'COMPLETED' : 'CANCELLED';
        try { return await delegate.update({ where: { id, companyId }, data: mapped }); } catch { return delegate.update({ where: { id }, data: mapped }); }
      }
      // Quality Control
      if (moduleSlug === 'quality-control') {
        const { id: _id, createdAt, updatedAt, ...rest } = data;
        const mapped: Record<string, any> = {};
        if (rest.checkNo !== undefined) mapped.checkNo = rest.checkNo;
        if (rest.product !== undefined) mapped.productId = rest.product;
        if (rest.inspector !== undefined) mapped.inspector = rest.inspector;
        if (rest.result !== undefined) mapped.result = rest.result === 'Pass' ? 'PASS' : rest.result === 'Fail' ? 'FAIL' : rest.result === 'Rework' ? 'REWORK' : 'PENDING';
        if (rest.notes !== undefined) mapped.notes = rest.notes;
        if (rest.checkedAt !== undefined) mapped.checkedAt = new Date(rest.checkedAt);
        try { return await delegate.update({ where: { id, companyId }, data: mapped }); } catch { return delegate.update({ where: { id }, data: mapped }); }
      }
      // Production Scheduling
      if (moduleSlug === 'production-scheduling') {
        const { id: _id, createdAt, updatedAt, workOrder, machine, ...rest } = data;
        const mapped: Record<string, any> = {};
        if (rest.scheduleNo !== undefined) mapped.scheduleNo = rest.scheduleNo;
        if (rest.workOrder || workOrder) mapped.workOrderId = rest.workOrder || workOrder;
        if (machine) {
          const found = await this.prisma.machine.findFirst({ where: { name: { contains: machine, mode: 'insensitive' }, companyId } });
          if (found) mapped.machineId = found.id;
        }
        if (rest.priority !== undefined) mapped.priority = rest.priority;
        if (rest.startDate !== undefined) mapped.startDate = new Date(rest.startDate);
        if (rest.endDate !== undefined) mapped.endDate = new Date(rest.endDate);
        if (rest.status !== undefined) mapped.status = rest.status;
        try { return await delegate.update({ where: { id, companyId }, data: mapped }); } catch { return delegate.update({ where: { id }, data: mapped }); }
      }
      // Bills of Materials
      if (moduleSlug === 'bills-of-materials-bom') {
        const { id: _id, createdAt, updatedAt, product, itemsCount, ...rest } = data;
        const mapped: Record<string, any> = {};
        if (rest.name !== undefined) mapped.name = rest.name;
        if (rest.product !== undefined) mapped.productId = rest.product;
        if (rest.version !== undefined) mapped.version = rest.version;
        if (rest.totalCost !== undefined) mapped.totalCost = Number(rest.totalCost);
        if (rest.status !== undefined) mapped.status = rest.status;
        try { return await delegate.update({ where: { id, companyId }, data: mapped }); } catch { return delegate.update({ where: { id }, data: mapped }); }
      }
    }
    // Normalise enum fields, strip display-only fields, and convert dates
    const cleaned = this.stripDisplayFields(this.normalizeEnumFields(pillarSlug, moduleSlug, this.convertDateStrings(this.normalizeBooleanFields(this.parseDocSize(data, pillarSlug)))));
    // Strip computed display fields specific to document management
    if (pillarSlug === "document-management") {
      delete cleaned.name;
      delete cleaned.type;
      delete cleaned.modified;
      // Only Document and DocumentVersion have a 'size' field
      if (delegate !== this.prisma.document && delegate !== this.prisma.documentVersion) {
        delete cleaned.size;
      }
      // DigitalSignature has document as a relation field (documentId), not a string
      if (delegate === this.prisma.digitalSignature) {
        delete cleaned.document;
      }
    }
        // ── BUDGETING: Strip status (display-only, not a DB field) ─────────
    if (pillarSlug === "finance-accounting" && moduleSlug === "budgeting") {
      const { status, ...budgetData } = data;
      const cleaned = this.stripDisplayFields(this.normalizeEnumFields(pillarSlug, moduleSlug, this.convertDateStrings(this.normalizeBooleanFields(budgetData))));
      delete cleaned.id;
      delete cleaned.companyId;
      return delegate.update({ where: { id }, data: cleaned });
    }

    try {
      return await delegate.update({ where: { id, companyId }, data: cleaned });
    } catch {
      // Some models (Leave, Attendance, Payroll) don't have a direct companyId field
      return delegate.update({ where: { id }, data: cleaned });
    }
  }

  async deleteData(pillarSlug: string, moduleSlug: string, id: string, companyId: string): Promise<any> {
    const delegate = this.getModelDelegate(pillarSlug, moduleSlug) as any;
    if (!delegate) return { message: `Record deleted (mock: ${moduleSlug})` };
    try {
      return await delegate.delete({ where: { id, companyId } });
    } catch {
      // Some models (Leave, Attendance, Payroll) don't have a direct companyId field
      return await delegate.delete({ where: { id } });
    }
  }
  // ── MARK INVOICE AS PAID (used by AP/AR modules) ────────────────────────

  async markInvoicePaid(id: string, companyId: string): Promise<any> {
    if (!companyId) {
      const firstCompany = await this.prisma.company.findFirst();
      companyId = firstCompany?.id ?? '';
    }
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException("Invoice not found");
    if (invoice.status === "PAID") throw new BadRequestException("Invoice is already paid");
    return this.prisma.invoice.update({
      where: { id },
      data: { status: "PAID" },
    });
  }


  // ── INVOICE STATS ──────────────────────────────────────────────────────

  async getInvoiceStats(companyId: string): Promise<any> {
    if (!companyId) {
      const firstCompany = await this.prisma.company.findFirst();
      companyId = firstCompany?.id ?? '';
    }

    const invoices = await this.prisma.invoice.findMany({
      where: { companyId },
      select: {
        id: true,
        invoiceNo: true,
        status: true,
        total: true,
        issueDate: true,
        customerId: true,
      },
      orderBy: { issueDate: 'desc' },
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-indexed

    let totalOutstanding = 0;
    let totalOverdue = 0;
    let totalPaid = 0;
    let monthlyRevenue = 0;
    let overdueCount = 0;
    let paidCount = 0;
    let outstandingCount = 0;
    let sentCount = 0;
    let draftCount = 0;

    // Monthly revenue breakdown (last 12 months)
    const monthlyMap: Record<string, { month: number; year: number; revenue: number; count: number }> = {};

    for (const inv of invoices) {
      const status = inv.status as string;
      const total = inv.total || 0;

      // Track monthly revenue
      if (inv.issueDate) {
        const d = new Date(inv.issueDate);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyMap[key]) {
          monthlyMap[key] = { month: d.getMonth() + 1, year: d.getFullYear(), revenue: 0, count: 0 };
        }
      }

      switch (status) {
        case 'PAID':
          totalPaid += total;
          paidCount++;
          // Add to monthly revenue for the issue month
          if (inv.issueDate) {
            const d = new Date(inv.issueDate);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlyMap[key].revenue += total;
            monthlyMap[key].count++;
          }
          break;
        case 'OVERDUE':
          totalOverdue += total;
          totalOutstanding += total;
          overdueCount++;
          outstandingCount++;
          break;
        case 'SENT':
          totalOutstanding += total;
          outstandingCount++;
          sentCount++;
          break;
        case 'DRAFT':
          totalOutstanding += total;
          outstandingCount++;
          draftCount++;
          break;
        case 'CANCELLED':
          // Not counted
          break;
        default:
          totalOutstanding += total;
          outstandingCount++;
      }
    }

    // Current month revenue (PAID only)
    const currentMonthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    monthlyRevenue = monthlyMap[currentMonthKey]?.revenue || 0;

    // Sort monthly data chronologically and take last 12
    const monthlyRevenueData = Object.values(monthlyMap)
      .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
      .slice(-12);

    return {
      totalOutstanding: Math.round(totalOutstanding * 100) / 100,
      totalOverdue: Math.round(totalOverdue * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      overdueCount,
      paidCount,
      outstandingCount,
      sentCount,
      draftCount,
      totalInvoices: invoices.length,
      monthlyRevenueData,
      asOf: now.toISOString(),
    };
  }

  // ── LEAD ACTIVITIES ────────────────────────────────────────────────────

  async getLeadActivities(leadId: string): Promise<any[]> {
    const activities = await this.prisma.leadActivity.findMany({
      where: { leadId },
      orderBy: { date: 'desc' },
    });
    const ACTIVITY_TYPE_LABELS: Record<string, string> = {
      CALL: '📞 Call',
      EMAIL: '📧 Email',
      MEETING: '🤝 Meeting',
      NOTE: '📝 Note',
      TASK: '✅ Task',
    };
    const ACTIVITY_ICONS: Record<string, string> = {
      CALL: 'bg-green-100 text-green-600',
      EMAIL: 'bg-blue-100 text-blue-600',
      MEETING: 'bg-purple-100 text-purple-600',
      NOTE: 'bg-amber-100 text-amber-600',
      TASK: 'bg-slate-100 text-slate-600',
    };
    return activities.map((a: any) => ({
      id: a.id,
      type: ACTIVITY_TYPE_LABELS[a.type] || a.type,
      typeRaw: a.type,
      icon: ACTIVITY_ICONS[a.type] || 'bg-slate-100 text-slate-600',
      title: a.title,
      notes: a.notes || '',
      outcome: a.outcome || '',
      date: a.date ? a.date.toISOString() : '',
      createdAt: a.createdAt ? a.createdAt.toISOString() : '',
    }));
  }

  async createLeadActivity(leadId: string, data: { type: string; title: string; notes?: string; outcome?: string; date?: string }): Promise<any> {
    // Validate type
    const VALID_TYPES = ['CALL', 'EMAIL', 'MEETING', 'NOTE', 'TASK'];
    const type = String(data.type || 'NOTE').toUpperCase();
    if (!VALID_TYPES.includes(type)) {
      throw new BadRequestException(`Invalid activity type. Must be one of: ${VALID_TYPES.join(', ')}`);
    }

    // Verify lead exists
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    const activity = await this.prisma.leadActivity.create({
      data: {
        type: type as any,
        title: data.title || '',
        notes: data.notes || '',
        outcome: data.outcome || '',
        date: data.date ? new Date(data.date) : new Date(),
        leadId,
      },
    });

    return activity;
  }

  async deleteLeadActivity(activityId: string): Promise<any> {
    return this.prisma.leadActivity.delete({ where: { id: activityId } });
  }

  // ── GENERATE DEMO DATA ─────────────────────────────────────────────────
  async generateDemoData(pillarSlug: string, moduleSlug: string, companyId: string): Promise<any> {
    if (pillarSlug === 'manufacturing') {
      const results: any[] = [];
      // Work Orders
      if (moduleSlug === 'work-orders' || moduleSlug === 'production-planning') {
        const demoWOs = [
          { orderNumber: 'DEMO-WO-1', productId: 'PRD-001', quantity: 500, status: 'PLANNED' as any, startDate: new Date(Date.now() + 86400000), endDate: new Date(Date.now() + 15 * 86400000) },
          { orderNumber: 'DEMO-WO-2', productId: 'PRD-003', quantity: 50, status: 'IN_PRODUCTION' as any, startDate: new Date(Date.now()), endDate: new Date(Date.now() + 20 * 86400000) },
          { orderNumber: 'DEMO-WO-3', productId: 'PRD-004', quantity: 200, status: 'COMPLETED' as any, startDate: new Date(Date.now() - 30 * 86400000), endDate: new Date(Date.now() - 15 * 86400000) },
        ];
        for (const wo of demoWOs) {
          const created = await this.prisma.workOrder.create({ data: { ...wo, companyId } });
          results.push({ type: 'WorkOrder', id: created.id });
        }
      }
      // Machines
      if (moduleSlug === 'machine-monitoring') {
        const demoMachines = [
          { machineNo: 'DEMO-MCH-1', name: 'CNC Milling Machine', model: 'Haas VF-2', utilization: 85, location: 'Bldg A - Section 1', status: 'OPERATIONAL' },
          { machineNo: 'DEMO-MCH-2', name: 'Injection Molder', model: 'Arburg 320C', utilization: 72, location: 'Bldg A - Section 2', status: 'OPERATIONAL' },
          { machineNo: 'DEMO-MCH-3', name: 'Packaging Line A', model: 'Bosch P2500', utilization: 45, location: 'Bldg B', status: 'MAINTENANCE' },
        ];
        for (const m of demoMachines) {
          const created = await this.prisma.machine.create({ data: { ...m, companyId } });
          results.push({ type: 'Machine', id: created.id });
        }
      }
      // Maintenance
      if (moduleSlug === 'maintenance') {
        const machine = await this.prisma.machine.findFirst({ where: { companyId } });
        if (machine) {
          const records = [
            { recordNo: 'DEMO-MT-1', title: 'Lubrication & Oil Change', machineId: machine.id, type: 'PREVENTIVE', scheduledDate: new Date(Date.now() + 7 * 86400000), cost: 15000, status: 'PLANNED' },
            { recordNo: 'DEMO-MT-2', title: 'Belt Replacement', machineId: machine.id, type: 'CORRECTIVE', scheduledDate: new Date(Date.now() + 14 * 86400000), cost: 45000, status: 'PLANNED' },
          ];
          for (const r of records) { const c = await this.prisma.maintenanceRecord.create({ data: { ...r, companyId } }); results.push({ type: 'Maintenance', id: c.id }); }
        }
      }
      // Quality Control
      if (moduleSlug === 'quality-control') {
        const checks = [
          { checkNo: 'DEMO-QC-1', productId: 'PRD-001', inspector: 'Tigist Haile', result: 'PASS', notes: 'All specifications met', checkedAt: new Date() },
          { checkNo: 'DEMO-QC-2', productId: 'PRD-003', inspector: 'Dawit Bekele', result: 'REWORK', notes: 'Dimensions out of tolerance', checkedAt: new Date() },
        ];
        for (const ch of checks) { const c = await this.prisma.qualityCheck.create({ data: { ...ch, companyId } }); results.push({ type: 'QualityCheck', id: c.id }); }
      }
      // Production Scheduling
      if (moduleSlug === 'production-scheduling') {
        const wo = await this.prisma.workOrder.findFirst({ where: { companyId } });
        const mach = await this.prisma.machine.findFirst({ where: { companyId } });
        const schedules = [
          { scheduleNo: 'DEMO-SCH-1', workOrderId: wo?.id || '', machineId: mach?.id || '', priority: 'HIGH', startDate: new Date(Date.now()), endDate: new Date(Date.now() + 5 * 86400000), status: 'IN_PROGRESS' },
          { scheduleNo: 'DEMO-SCH-2', workOrderId: '', machineId: '', priority: 'MEDIUM', startDate: new Date(Date.now() + 7 * 86400000), endDate: new Date(Date.now() + 14 * 86400000), status: 'SCHEDULED' },
        ];
        for (const s of schedules) { const c = await this.prisma.productionSchedule.create({ data: { ...s, companyId } }); results.push({ type: 'Schedule', id: c.id }); }
      }
      // Bills of Materials
      if (moduleSlug === 'bills-of-materials-bom') {
        const boms = [
          { name: 'Teff Flour Blend BOM', productId: 'PRD-001', version: '1.0', totalCost: 450000, status: 'ACTIVE' },
          { name: 'Coffee Export Pack BOM', productId: 'PRD-004', version: '2.0', totalCost: 520000, status: 'ACTIVE' },
        ];
        for (const b of boms) { const c = await this.prisma.billOfMaterial.create({ data: { ...b, companyId } }); results.push({ type: 'BOM', id: c.id }); }
      }
      return { created: results.length, details: results };
    }

    const results: any[] = [];

    if (moduleSlug === 'tax-vat') {
      const sampleVatEntries = [
        { date: new Date(Date.now()), ref: 'VAT-001', description: 'Output VAT - Sunrise PLC - INV-2026-001', taxableAmount: 250000, vatAmount: 37500, type: 'Output VAT (Sales)', status: 'Filed' },
        { date: new Date(Date.now() - 86400000), ref: 'VAT-002', description: 'Input VAT - Office Rent July 2026', taxableAmount: 45000, vatAmount: 6750, type: 'Input VAT (Purchases)', status: 'Filed' },
        { date: new Date(Date.now() - 2 * 86400000), ref: 'VAT-003', description: 'Output VAT - Green Valley Ltd - INV-2026-002', taxableAmount: 180000, vatAmount: 27000, type: 'Output VAT (Sales)', status: 'Pending' },
        { date: new Date(Date.now() - 3 * 86400000), ref: 'VAT-004', description: 'Input VAT - AWS Cloud Services', taxableAmount: 12000, vatAmount: 1800, type: 'Input VAT (Purchases)', status: 'Filed' },
        { date: new Date(Date.now() - 4 * 86400000), ref: 'VAT-005', description: 'Output VAT - Addis Tech - INV-2026-004', taxableAmount: 1200000, vatAmount: 180000, type: 'Output VAT (Sales)', status: 'Pending' },
        { date: new Date(Date.now() - 5 * 86400000), ref: 'VAT-006', description: 'Input VAT - Marketing Ads Meta', taxableAmount: 35000, vatAmount: 5250, type: 'Input VAT (Purchases)', status: 'Pending' },
      ];
      for (const entry of sampleVatEntries) {
        const created = await this.prisma.vatEntry.create({
          data: { ...entry, companyId },
        });
        results.push({ type: 'VatEntry', id: created.id, ref: entry.ref });
      }
    }

    if (moduleSlug === 'fixed-assets') {
      const sampleAssets = [
        { name: 'Demo Server Equipment', category: 'IT_EQUIPMENT', purchaseValue: 350000, currentValue: 315000, depreciationRate: 10, location: 'Server Room' },
        { name: 'Demo Office Renovation', category: 'BUILDING', purchaseValue: 800000, currentValue: 720000, depreciationRate: 10, location: 'HQ' },
        { name: 'Demo Delivery Van', category: 'VEHICLE', purchaseValue: 1200000, currentValue: 960000, depreciationRate: 15, location: 'Fleet Yard' },
      ];
      for (const asset of sampleAssets) {
        const a = await this.prisma.fixedAsset.create({
          data: { ...asset, purchaseDate: new Date('2024-01-01'), companyId },
        });
        results.push({ type: 'FixedAsset', id: a.id, name: asset.name });
      }
    }

    if (moduleSlug === 'budgeting') {
      const sampleBudgets = [
        { name: 'Demo IT Budget', department: 'IT', year: 2026, month: 8, amount: 150000, spent: 45000 },
        { name: 'Demo Marketing Budget', department: 'Marketing', year: 2026, month: 8, amount: 90000, spent: 28000 },
        { name: 'Demo HR Budget', department: 'HR', year: 2026, month: 8, amount: 50000, spent: 50000 },
      ];
      for (const b of sampleBudgets) {
        const created = await this.prisma.budget.create({ data: { ...b, companyId } });
        results.push({ type: 'Budget', id: created.id, name: b.name });
      }
    }


    if (moduleSlug === 'vendor-management' || moduleSlug === 'supplier-portal') {
      const sampleVendors = [
        { name: 'Premier Supplies Ltd', email: 'info@premier.et', phone: '+251944001001', category: 'Goods', rating: 4, isActive: true },
        { name: 'Digital Solutions PLC', email: 'sales@digital.et', phone: '+251944002002', category: 'IT', rating: 5, isActive: true },
      ];
      for (const v of sampleVendors) {
        const created = await this.prisma.vendor.create({ data: { ...v, companyId } });
        results.push({ type: 'Vendor', id: created.id, name: v.name });
      }
    }

    if (moduleSlug === 'contract-management') {
      const sampleContracts = [
        { title: 'Demo Maintenance Contract', value: 120000, startDate: new Date(), endDate: new Date(Date.now() + 365 * 86400000), status: 'ACTIVE' as any },
        { title: 'Demo Consulting Agreement', value: 450000, startDate: new Date(), endDate: new Date(Date.now() + 180 * 86400000), status: 'DRAFT' as any },
      ];
      for (const ct of sampleContracts) {
        const created = await this.prisma.contract.create({ data: { ...ct, companyId } });
        results.push({ type: 'Contract', id: created.id, title: ct.title });
      }
    }

    if (moduleSlug === 'rfqs') {
      const sampleRfqs = [
        { rfqNo: 'DEMO-RFQ-001', title: 'Demo Office Supplies', requester: 'Abebech Alemu', dueDate: new Date(Date.now() + 30 * 86400000), total: 250000, status: 'Sent' },
        { rfqNo: 'DEMO-RFQ-002', title: 'Demo IT Equipment', requester: 'Meklit Haile', dueDate: new Date(Date.now() + 45 * 86400000), total: 800000, status: 'Draft' },
      ];
      for (const rf of sampleRfqs) {
        const created = await this.prisma.rfq.create({ data: { ...rf, companyId } });
        results.push({ type: 'Rfq', id: created.id, rfqNo: rf.rfqNo });
      }
    }

    if (moduleSlug === 'approval-workflow') {
      const sampleApprovals = [
        { requestNo: 'DEMO-APR-001', module: 'Purchase Request', requestedBy: 'Abebech Alemu', approver: 'Kebede Tadesse', status: 'Pending' },
        { requestNo: 'DEMO-APR-002', module: 'Contract', requestedBy: 'Meklit Haile', approver: 'Yonas Tadesse', status: 'Approved' },
      ];
      for (const ap of sampleApprovals) {
        const created = await this.prisma.approvalWorkflow.create({ data: { ...ap, companyId } });
        results.push({ type: 'Approval', id: created.id, requestNo: ap.requestNo });
      }
    }

    if (moduleSlug === 'tender-management') {
      const sampleTenders = [
        { tenderNo: 'DEMO-TDR-001', title: 'Demo Construction Project', department: 'Facilities', issueDate: new Date(), closingDate: new Date(Date.now() + 60 * 86400000), budget: 5000000, status: 'Open' },
        { tenderNo: 'DEMO-TDR-002', title: 'Demo IT Infrastructure', department: 'IT', issueDate: new Date(), closingDate: new Date(Date.now() + 45 * 86400000), budget: 2000000, status: 'Under Evaluation' },
      ];
      for (const td of sampleTenders) {
        const created = await this.prisma.tender.create({ data: { ...td, companyId } });
        results.push({ type: 'Tender', id: created.id, tenderNo: td.tenderNo });
      }
    }

    return { created: results.length, details: results };
  }

}
