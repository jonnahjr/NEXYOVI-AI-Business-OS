import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is required in .env');

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: { name: 'Nexyovi Enterprise', slug: 'nexyovi-enterprise', industry: 'Software', isActive: true }
    });
  }
  const companyId = company.id;
  console.log(`Seeding CRM & Finance for: ${company.name}`);

  // ── CUSTOMERS ─────────────────────────────────────────────────
  const c1 = await prisma.customer.create({ data: { name: 'Sunrise PLC', email: 'contact@sunrise.et', phone: '+251911001001', company: 'Sunrise PLC', type: 'BUSINESS', status: 'ACTIVE', source: 'Referral', companyId } });
  const c2 = await prisma.customer.create({ data: { name: 'Green Valley Ltd', email: 'info@greenvalley.et', phone: '+251922002002', company: 'Green Valley', type: 'BUSINESS', status: 'ACTIVE', source: 'Website', companyId } });
  const c3 = await prisma.customer.create({ data: { name: 'Mehari Tesfaye', email: 'mehari@personal.et', phone: '+251933003003', type: 'INDIVIDUAL', status: 'PROSPECT', source: 'Cold Call', companyId } });
  console.log('Customers seeded');

  // ── LEADS ─────────────────────────────────────────────────────
  await prisma.lead.createMany({
    data: [
      { name: 'Selam Habtamu', email: 'selam@corp.et', phone: '+251944004004', company: 'Addis Corp', source: 'WEBSITE', status: 'QUALIFIED', score: 80, estimatedValue: 180000, companyId },
      { name: 'Kifle Amare', email: 'kifle@tech.et', phone: '+251955005005', company: 'Tech Hub', source: 'REFERRAL', status: 'PROPOSAL', score: 65, estimatedValue: 480000, companyId },
      { name: 'Hana Girma', email: 'hana@biz.et', phone: '+251966006006', company: 'Biz Solutions', source: 'SOCIAL_MEDIA', status: 'NEW', score: 30, estimatedValue: 95000, companyId },
      { name: 'Dawit Bekele', email: 'dawit@startup.et', phone: '+251977007007', company: 'Startup ET', source: 'EMAIL_CAMPAIGN', status: 'CONTACTED', score: 50, estimatedValue: 220000, companyId },
    ],
    skipDuplicates: true
  });
  console.log('Leads seeded');

  // ── DEALS ─────────────────────────────────────────────────────
  await prisma.deal.createMany({
    data: [
      { title: 'ERP Implementation – Sunrise PLC', value: 2500000, stage: 'NEGOTIATION', closeDate: new Date('2026-09-01'), customerId: c1.id, companyId },
      { title: 'HR Module – Green Valley', value: 850000, stage: 'PROPOSAL', closeDate: new Date('2026-08-15'), customerId: c2.id, companyId },
      { title: 'Consulting Package – Mehari', value: 120000, stage: 'PROSPECTING', customerId: c3.id, companyId },
    ],
    skipDuplicates: true
  });
  console.log('Deals seeded');

  // ── INVOICES ──────────────────────────────────────────────────
  await prisma.invoice.createMany({
    data: [
      { invoiceNo: 'INV-2026-001', subTotal: 250000, taxAmount: 0, total: 250000, status: 'PAID', dueDate: new Date('2026-07-30'), customerId: c1.id, companyId },
      { invoiceNo: 'INV-2026-002', subTotal: 180000, taxAmount: 0, total: 180000, status: 'OVERDUE', dueDate: new Date('2026-06-30'), customerId: c2.id, companyId },
      { invoiceNo: 'INV-2026-003', subTotal: 450000, taxAmount: 27000, total: 477000, status: 'SENT', dueDate: new Date('2026-08-01'), customerId: c3.id, companyId },
    ],
    skipDuplicates: true
  });
  console.log('Invoices seeded');

  // ── EXPENSES ──────────────────────────────────────────────────
  await prisma.expense.createMany({
    data: [
      { title: 'Office Rent – July 2026', amount: 45000, category: 'RENT', date: new Date('2026-07-01'), status: 'APPROVED', companyId },
      { title: 'AWS Cloud Services', amount: 12000, category: 'IT', date: new Date('2026-07-02'), status: 'APPROVED', companyId },
      { title: 'Team Lunch – Q3 Kickoff', amount: 8500, category: 'MEALS', date: new Date('2026-07-03'), status: 'PENDING', companyId },
      { title: 'Marketing Ads – Meta', amount: 35000, category: 'MARKETING', date: new Date('2026-07-04'), status: 'APPROVED', companyId },
    ],
    skipDuplicates: true
  });
  console.log('Expenses seeded');

  // ── PRODUCTS ──────────────────────────────────────────────────
  await prisma.product.createMany({
    data: [
      { sku: 'PRD-001', name: 'Injera Flour (50kg)', category: 'Food', stock: 842, unit: 'Bag', sellPrice: 1200, costPrice: 800, companyId },
      { sku: 'PRD-002', name: 'Teff Grain (25kg)', category: 'Food', stock: 23, unit: 'Bag', sellPrice: 890, costPrice: 600, companyId },
      { sku: 'PRD-003', name: 'HP Laptop 15"', category: 'Electronics', stock: 12, unit: 'Piece', sellPrice: 48000, costPrice: 38000, companyId },
      { sku: 'PRD-004', name: 'Coffee Arabica (Export)', category: 'Export', stock: 340, unit: 'Quintal', sellPrice: 82000, costPrice: 65000, companyId },
    ],
    skipDuplicates: true
  });
  console.log('Products seeded');

  // ── VENDORS ───────────────────────────────────────────────────
  await prisma.vendor.createMany({
    data: [
      { name: 'Ethio Supply Co', email: 'supply@ethio.et', phone: '+251911111111', category: 'Goods', rating: 4, isActive: true, companyId },
      { name: 'TechParts Ethiopia', email: 'parts@techparts.et', phone: '+251922222222', category: 'IT', rating: 5, isActive: true, companyId },
      { name: 'Global Imports PLC', email: 'imports@global.et', phone: '+251933333333', category: 'Imports', rating: 3, isActive: true, companyId },
    ],
    skipDuplicates: true
  });
  console.log('Vendors seeded');

  console.log('\n✅ All CRM & Finance & Inventory data seeded successfully!');
}

main().catch(e => { console.error(e); process.exit(1); });
