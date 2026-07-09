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
  const c4 = await prisma.customer.create({ data: { name: 'Addis Tech Solutions', email: 'info@addistech.et', phone: '+251944004004', company: 'Addis Tech', type: 'BUSINESS', status: 'ACTIVE', source: 'Website', companyId } });
  const c5 = await prisma.customer.create({ data: { name: 'Blue Nile Exports', email: 'export@bluenile.et', phone: '+251955005005', company: 'Blue Nile Exports', type: 'BUSINESS', status: 'ACTIVE', source: 'Referral', companyId } });
  const c6 = await prisma.customer.create({ data: { name: 'Zerihun Mamo', email: 'zerihun@consult.et', phone: '+251966006006', type: 'INDIVIDUAL', status: 'ACTIVE', source: 'Email Campaign', companyId } });
  const c7 = await prisma.customer.create({ data: { name: 'Ethio Manufacturing PLC', email: 'info@ethiomfg.et', phone: '+251977007007', company: 'Ethio Mfg Plc', type: 'BUSINESS', status: 'INACTIVE', source: 'Cold Call', companyId } });
  console.log('Customers seeded');

  // ── LEADS ─────────────────────────────────────────────────────
  const l1 = await prisma.lead.create({ data: { name: 'Selam Habtamu', email: 'selam@corp.et', phone: '+251944004004', company: 'Addis Corp', source: 'WEBSITE', status: 'QUALIFIED', score: 80, estimatedValue: 180000, companyId } });
  const l2 = await prisma.lead.create({ data: { name: 'Kifle Amare', email: 'kifle@tech.et', phone: '+251955005005', company: 'Tech Hub', source: 'REFERRAL', status: 'PROPOSAL', score: 65, estimatedValue: 480000, companyId } });
  const l3 = await prisma.lead.create({ data: { name: 'Hana Girma', email: 'hana@biz.et', phone: '+251966006006', company: 'Biz Solutions', source: 'SOCIAL_MEDIA', status: 'NEW', score: 30, estimatedValue: 95000, companyId } });
  const l4 = await prisma.lead.create({ data: { name: 'Dawit Bekele', email: 'dawit@startup.et', phone: '+251977007007', company: 'Startup ET', source: 'EMAIL_CAMPAIGN', status: 'CONTACTED', score: 50, estimatedValue: 220000, companyId } });
  const l5 = await prisma.lead.create({ data: { name: 'Tsion Alemu', email: 'tsion@fintech.et', phone: '+251988008008', company: 'FinTech ET', source: 'COLD_CALL', status: 'NEGOTIATION', score: 90, estimatedValue: 750000, companyId } });
  const l6 = await prisma.lead.create({ data: { name: 'Yonas Tadesse', email: 'yonas@logistics.et', phone: '+251999009009', company: 'LogiTrans', source: 'WEBSITE', status: 'CLOSED_WON', score: 95, estimatedValue: 1200000, companyId } });
  const l7 = await prisma.lead.create({ data: { name: 'Meklit Haile', email: 'meklit@edu.et', phone: '+251910010010', company: 'Addis University', source: 'REFERRAL', status: 'CLOSED_LOST', score: 20, estimatedValue: 350000, companyId } });
  console.log('Leads seeded');

  // ── DEALS ─────────────────────────────────────────────────────
  const d1 = await prisma.deal.create({ data: { title: 'ERP Implementation – Sunrise PLC', value: 2500000, stage: 'NEGOTIATION', probability: 75, closeDate: new Date('2026-09-01'), customerId: c1.id, companyId } });
  const d2 = await prisma.deal.create({ data: { title: 'HR Module – Green Valley', value: 850000, stage: 'PROPOSAL', probability: 60, closeDate: new Date('2026-08-15'), customerId: c2.id, companyId } });
  const d3 = await prisma.deal.create({ data: { title: 'Consulting Package – Mehari', value: 120000, stage: 'PROSPECTING', probability: 25, customerId: c3.id, companyId } });
  const d4 = await prisma.deal.create({ data: { title: 'Cloud Migration – Addis Tech', value: 1800000, stage: 'QUALIFICATION', probability: 40, closeDate: new Date('2026-10-01'), customerId: c4.id, companyId } });
  const d5 = await prisma.deal.create({ data: { title: 'Export Logistics Platform – Blue Nile', value: 3200000, stage: 'NEGOTIATION', probability: 80, closeDate: new Date('2026-08-30'), customerId: c5.id, companyId } });
  const d6 = await prisma.deal.create({ data: { title: 'Analytics Dashboard – Zerihun Mamo', value: 450000, stage: 'PROPOSAL', probability: 55, closeDate: new Date('2026-09-15'), customerId: c6.id, companyId } });
  const d7 = await prisma.deal.create({ data: { title: 'Manufacturing Suite – Ethio Mfg', value: 5000000, stage: 'PROSPECTING', probability: 15, customerId: c7.id, companyId } });
  const d8 = await prisma.deal.create({ data: { title: 'Retail POS System – Sunrise PLC', value: 980000, stage: 'CLOSED_WON', probability: 100, closeDate: new Date('2026-07-01'), customerId: c1.id, companyId } });
  const d9 = await prisma.deal.create({ data: { title: 'Inventory Management – Green Valley', value: 620000, stage: 'CLOSED_LOST', probability: 0, closeDate: new Date('2026-06-15'), customerId: c2.id, companyId } });
  console.log('Deals seeded');

  // ── INVOICES ──────────────────────────────────────────────────
  const i1 = await prisma.invoice.create({ data: { invoiceNo: 'INV-2026-001', subTotal: 250000, taxAmount: 0, total: 250000, status: 'PAID', issueDate: new Date('2026-07-01'), dueDate: new Date('2026-07-30'), customerId: c1.id, companyId } });
  const i2 = await prisma.invoice.create({ data: { invoiceNo: 'INV-2026-002', subTotal: 180000, taxAmount: 0, total: 180000, status: 'OVERDUE', issueDate: new Date('2026-06-01'), dueDate: new Date('2026-06-30'), customerId: c2.id, companyId } });
  const i3 = await prisma.invoice.create({ data: { invoiceNo: 'INV-2026-003', subTotal: 450000, taxAmount: 27000, total: 477000, status: 'SENT', issueDate: new Date('2026-07-15'), dueDate: new Date('2026-08-01'), customerId: c3.id, companyId } });
  const i4 = await prisma.invoice.create({ data: { invoiceNo: 'INV-2026-004', subTotal: 1200000, taxAmount: 72000, total: 1272000, status: 'SENT', issueDate: new Date('2026-07-20'), dueDate: new Date('2026-08-20'), customerId: c4.id, companyId } });
  const i5 = await prisma.invoice.create({ data: { invoiceNo: 'INV-2026-005', subTotal: 650000, taxAmount: 0, total: 650000, status: 'PAID', issueDate: new Date('2026-06-15'), dueDate: new Date('2026-07-15'), customerId: c5.id, companyId } });
  const i6 = await prisma.invoice.create({ data: { invoiceNo: 'INV-2026-006', subTotal: 85000, taxAmount: 5100, total: 90100, status: 'DRAFT', issueDate: new Date('2026-07-25'), dueDate: new Date('2026-08-25'), customerId: c6.id, companyId } });
  const i7 = await prisma.invoice.create({ data: { invoiceNo: 'INV-2026-007', subTotal: 320000, taxAmount: 19200, total: 339200, status: 'OVERDUE', issueDate: new Date('2026-05-01'), dueDate: new Date('2026-05-30'), customerId: c1.id, companyId } });
  console.log('Invoices seeded');

  // ── LEAD ACTIVITIES ────────────────────────────────────────────
  await prisma.leadActivity.createMany({
    data: [
      { type: 'CALL', title: 'Initial discovery call', notes: 'Discussed ERP needs, budget around 200k', outcome: 'Interested', date: new Date('2026-07-02'), leadId: l1.id },
      { type: 'EMAIL', title: 'Sent proposal document', notes: 'Emailed the full proposal package', outcome: 'Meeting Scheduled', date: new Date('2026-07-05'), leadId: l1.id },
      { type: 'MEETING', title: 'Product demo session', notes: 'Walked through the platform capabilities', outcome: 'Interested', date: new Date('2026-07-08'), leadId: l1.id },
      { type: 'CALL', title: 'Follow-up call', notes: 'Left voicemail, will call back', outcome: 'Call Back Later', date: new Date('2026-07-03'), leadId: l2.id },
      { type: 'EMAIL', title: 'Sent case studies', notes: 'Shared relevant case studies for their industry', date: new Date('2026-07-07'), leadId: l2.id },
      { type: 'NOTE', title: 'Internal note', notes: 'Budget approved by finance team', date: new Date('2026-07-10'), leadId: l2.id },
      { type: 'TASK', title: 'Prepare custom quote', notes: 'Need to create a tailored pricing', outcome: 'Task Created', date: new Date('2026-07-06'), leadId: l5.id },
      { type: 'CALL', title: 'Warm introduction call', notes: 'Referred by existing customer Sunrise PLC', outcome: 'Interested', date: new Date('2026-07-04'), leadId: l5.id },
      { type: 'EMAIL', title: 'Welcome email', notes: 'Sent onboarding information', date: new Date('2026-07-01'), leadId: l6.id },
      { type: 'MEETING', title: 'Final negotiation', notes: 'Could not agree on pricing terms', outcome: 'Not Interested', date: new Date('2026-06-28'), leadId: l7.id },
    ],
    skipDuplicates: true
  });
  console.log('Lead activities seeded');

  // ── PRODUCTS (must be before INVOICE ITEMS and CONTRACTS) ────────
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

  // ── VENDORS (must be before CONTRACTS) ─────────────────────────
  await prisma.vendor.createMany({
    data: [
      { name: 'Ethio Supply Co', email: 'supply@ethio.et', phone: '+251911111111', category: 'Goods', rating: 4, isActive: true, companyId },
      { name: 'TechParts Ethiopia', email: 'parts@techparts.et', phone: '+251922222222', category: 'IT', rating: 5, isActive: true, companyId },
      { name: 'Global Imports PLC', email: 'imports@global.et', phone: '+251933333333', category: 'Imports', rating: 3, isActive: true, companyId },
    ],
    skipDuplicates: true
  });
  console.log('Vendors seeded');

  // ── INVOICE ITEMS ────────────────────────────────────────────────
  const p1 = await prisma.product.findFirst({ where: { sku: 'PRD-001', companyId } });
  const p2 = await prisma.product.findFirst({ where: { sku: 'PRD-003', companyId } });
  const p3 = await prisma.product.findFirst({ where: { sku: 'PRD-004', companyId } });
  if (p1) {
    await prisma.invoiceItem.createMany({
      data: [
        { description: 'Injera Flour (50kg) x 50', quantity: 50, unitPrice: 1200, total: 60000, invoiceId: i1.id, productId: p1.id },
        { description: 'Setup & Installation Fee', quantity: 1, unitPrice: 190000, total: 190000, invoiceId: i1.id },
        { description: 'Injera Flour (50kg) x 80', quantity: 80, unitPrice: 1200, total: 96000, invoiceId: i2.id, productId: p1.id },
        { description: 'Consulting Services', quantity: 1, unitPrice: 84000, total: 84000, invoiceId: i2.id },
        { description: 'Coffee Arabica (Export) x 3', quantity: 3, unitPrice: 82000, total: 246000, invoiceId: i3.id, productId: p3!.id },
        { description: 'Logistics & Shipping', quantity: 1, unitPrice: 204000, total: 204000, invoiceId: i3.id },
        { description: 'HP Laptop 15" x 10', quantity: 10, unitPrice: 48000, total: 480000, invoiceId: i4.id, productId: p2!.id },
        { description: 'Software License Pack', quantity: 1, unitPrice: 720000, total: 720000, invoiceId: i4.id },
        { description: 'Coffee Arabica (Export) x 5', quantity: 5, unitPrice: 82000, total: 410000, invoiceId: i5.id, productId: p3!.id },
        { description: 'Inspection Service', quantity: 1, unitPrice: 240000, total: 240000, invoiceId: i5.id },
        { description: 'Consulting Hourly x 10', quantity: 10, unitPrice: 8500, total: 85000, invoiceId: i6.id },
        { description: 'Injera Flour (50kg) x 150', quantity: 150, unitPrice: 1200, total: 180000, invoiceId: i7.id, productId: p1.id },
        { description: 'Priority Delivery Charge', quantity: 1, unitPrice: 140000, total: 140000, invoiceId: i7.id },
      ],
      skipDuplicates: true
    });
  }
  console.log('Invoice items seeded');

  // ── CONTRACTS ────────────────────────────────────────────────────
  const v1 = await prisma.vendor.findFirst({ where: { name: 'Ethio Supply Co', companyId } });
  const v2 = await prisma.vendor.findFirst({ where: { name: 'TechParts Ethiopia', companyId } });
  const v3 = await prisma.vendor.findFirst({ where: { name: 'Global Imports PLC', companyId } });
  await prisma.contract.createMany({
    data: [
      { title: 'Annual Supply Agreement – Food Goods', value: 3600000, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), status: 'ACTIVE', vendorId: v1!.id, companyId },
      { title: 'IT Hardware Procurement Contract', value: 8400000, startDate: new Date('2026-03-01'), endDate: new Date('2027-02-28'), status: 'ACTIVE', vendorId: v2!.id, companyId },
      { title: 'Import Freight & Logistics Agreement', value: 2500000, startDate: new Date('2026-02-01'), endDate: new Date('2026-08-01'), status: 'EXPIRED', vendorId: v3!.id, companyId },
      { title: 'Office Supplies & Stationery', value: 480000, startDate: new Date('2026-04-01'), endDate: new Date('2027-03-31'), status: 'DRAFT', vendorId: v1!.id, companyId },
      { title: 'Cloud Infrastructure Subscription', value: 1200000, startDate: new Date('2026-05-01'), status: 'ACTIVE', vendorId: v2!.id, companyId },
      { title: 'Consulting Retainer – Strategic Advisory', value: 600000, startDate: new Date('2026-06-01'), endDate: new Date('2026-09-01'), status: 'TERMINATED', vendorId: v3!.id, companyId },
    ],
    skipDuplicates: true
  });
  console.log('Contracts seeded');

  // ── EXPENSES ──────────────────────────────────────────────────
  await prisma.expense.createMany({
    data: [
      { title: 'Office Rent – July 2026', amount: 45000, category: 'RENT', date: new Date('2026-07-01'), status: 'APPROVED', companyId },
      { title: 'AWS Cloud Services', amount: 12000, category: 'IT', date: new Date('2026-07-02'), status: 'APPROVED', companyId },
      { title: 'Team Lunch – Q3 Kickoff', amount: 8500, category: 'MEALS', date: new Date('2026-07-03'), status: 'PENDING', companyId },
      { title: 'Marketing Ads – Meta', amount: 35000, category: 'MARKETING', date: new Date('2026-07-04'), status: 'APPROVED', companyId },
      { title: 'Electricity & Utilities', amount: 18000, category: 'UTILITIES', date: new Date('2026-06-30'), status: 'APPROVED', companyId },
      { title: 'Internet & Telecom', amount: 8500, category: 'IT', date: new Date('2026-06-28'), status: 'APPROVED', companyId },
      { title: 'Staff Training – Leadership Workshop', amount: 65000, category: 'TRAINING', date: new Date('2026-06-25'), status: 'APPROVED', companyId },
      { title: 'Office Supplies – Stationery', amount: 3200, category: 'OFFICE_SUPPLIES', date: new Date('2026-06-22'), status: 'REIMBURSED', companyId },
      { title: 'Travel – Client Visit to Bahir Dar', amount: 22500, category: 'TRAVEL', date: new Date('2026-06-20'), status: 'APPROVED', companyId },
      { title: 'Software Licenses – Microsoft 365', amount: 48000, category: 'IT', date: new Date('2026-06-15'), status: 'APPROVED', companyId },
      { title: 'Insurance Premium – Q3', amount: 32000, category: 'INSURANCE', date: new Date('2026-07-05'), status: 'PENDING', companyId },
      { title: 'Consulting Fees – Tax Advisory', amount: 40000, category: 'PROFESSIONAL_FEES', date: new Date('2026-07-06'), status: 'PENDING', companyId },
      { title: 'Employee Salaries – June 2026', amount: 267000, category: 'SALARIES', date: new Date('2026-06-30'), status: 'APPROVED', companyId },
      { title: 'Fuel & Transport – Fleet', amount: 18500, category: 'TRANSPORT', date: new Date('2026-06-18'), status: 'APPROVED', companyId },
      { title: 'Bank Charges – June 2026', amount: 2400, category: 'BANK_CHARGES', date: new Date('2026-06-30'), status: 'REIMBURSED', companyId },
    ],
    skipDuplicates: true
  });
  console.log('Expenses seeded');

  // ── BUDGETS ────────────────────────────────────────────────────
  await prisma.budget.createMany({
    data: [
      { name: 'IT Infrastructure & Software', department: 'IT', year: 2026, month: 7, amount: 120000, spent: 60000, companyId },
      { name: 'Marketing & Advertising', department: 'Marketing', year: 2026, month: 7, amount: 80000, spent: 35000, companyId },
      { name: 'Office Operations', department: 'Admin', year: 2026, month: 7, amount: 65000, spent: 45000, companyId },
      { name: 'Staff Training & Development', department: 'HR', year: 2026, month: 7, amount: 40000, spent: 65000, companyId },
      { name: 'Travel & Client Visits', department: 'Sales', year: 2026, month: 7, amount: 50000, spent: 22500, companyId },
      { name: 'IT Infrastructure & Software', department: 'IT', year: 2026, month: 6, amount: 120000, spent: 115000, companyId },
      { name: 'Marketing & Advertising', department: 'Marketing', year: 2026, month: 6, amount: 80000, spent: 72000, companyId },
      { name: 'Office Operations', department: 'Admin', year: 2026, month: 6, amount: 65000, spent: 63200, companyId },
      { name: 'Annual Budget – IT Department', department: 'IT', year: 2026, month: null, amount: 1440000, spent: 720000, companyId },
      { name: 'Annual Budget – Marketing', department: 'Marketing', year: 2026, month: null, amount: 960000, spent: 420000, companyId },
      { name: 'Annual Budget – Operations', department: 'Admin', year: 2026, month: null, amount: 780000, spent: 450000, companyId },
      { name: 'Annual Budget – HR', department: 'HR', year: 2026, month: null, amount: 480000, spent: 180000, companyId },
    ],
    skipDuplicates: true
  });
  console.log('Budgets seeded');

  // ── FIXED ASSETS ───────────────────────────────────────────────
  await prisma.fixedAsset.createMany({
    data: [
      { name: 'Office Building – HQ', category: 'BUILDING', purchaseDate: new Date('2020-01-15'), purchaseValue: 15000000, currentValue: 13500000, depreciationRate: 5, location: 'Addis Ababa (Bole)', companyId },
      { name: 'Toyota Hilux – Fleet Vehicle', category: 'VEHICLE', purchaseDate: new Date('2022-03-20'), purchaseValue: 4200000, currentValue: 3150000, depreciationRate: 15, location: 'Addis Ababa (HQ)', companyId },
      { name: 'Isuzu Truck FVR', category: 'VEHICLE', purchaseDate: new Date('2021-11-10'), purchaseValue: 6500000, currentValue: 4225000, depreciationRate: 15, location: 'Addis Ababa (HQ)', companyId },
      { name: 'Office Furniture & Fixtures', category: 'FURNITURE', purchaseDate: new Date('2022-06-01'), purchaseValue: 1800000, currentValue: 1260000, depreciationRate: 10, location: 'Addis Ababa (HQ)', companyId },
      { name: 'Server Rack & Networking', category: 'IT_EQUIPMENT', purchaseDate: new Date('2023-02-15'), purchaseValue: 850000, currentValue: 595000, depreciationRate: 20, location: 'Addis Ababa (HQ)', companyId },
      { name: 'Laptop Fleet – Employee Devices', category: 'IT_EQUIPMENT', purchaseDate: new Date('2024-01-10'), purchaseValue: 2400000, currentValue: 1680000, depreciationRate: 25, location: 'Addis Ababa (HQ)', companyId },
      { name: 'Air Conditioning System', category: 'BUILDING', purchaseDate: new Date('2023-06-20'), purchaseValue: 450000, currentValue: 360000, depreciationRate: 10, location: 'Addis Ababa (HQ)', companyId },
      { name: 'Generator – 50KVA', category: 'EQUIPMENT', purchaseDate: new Date('2022-09-05'), purchaseValue: 480000, currentValue: 336000, depreciationRate: 12, location: 'Addis Ababa (HQ)', companyId },
      { name: 'Warehouse Shelving & Racking', category: 'WAREHOUSE', purchaseDate: new Date('2023-04-01'), purchaseValue: 600000, currentValue: 480000, depreciationRate: 10, location: 'North Hub (Gondar)', companyId },
      { name: 'Biometric Attendance Devices', category: 'EQUIPMENT', purchaseDate: new Date('2024-06-01'), purchaseValue: 180000, currentValue: 144000, depreciationRate: 20, location: 'Addis Ababa (HQ)', companyId },
    ],
    skipDuplicates: true
  });
  console.log('Fixed assets seeded');

  // ── VAT ENTRIES (Tax & VAT module) ──────────────────────────────
  await prisma.vatEntry.createMany({
    data: [
      { date: new Date('2026-07-01'), ref: 'VAT-001', description: 'Output VAT – Sunrise PLC – INV-2026-001', taxableAmount: 250000, vatAmount: 37500, type: 'Output VAT (Sales)', status: 'Filed', companyId },
      { date: new Date('2026-07-02'), ref: 'VAT-002', description: 'Input VAT – Office Rent July 2026', taxableAmount: 45000, vatAmount: 6750, type: 'Input VAT (Purchases)', status: 'Filed', companyId },
      { date: new Date('2026-07-03'), ref: 'VAT-003', description: 'Output VAT – Green Valley Ltd – INV-2026-002', taxableAmount: 180000, vatAmount: 27000, type: 'Output VAT (Sales)', status: 'Pending', companyId },
      { date: new Date('2026-07-04'), ref: 'VAT-004', description: 'Input VAT – AWS Cloud Services', taxableAmount: 12000, vatAmount: 1800, type: 'Input VAT (Purchases)', status: 'Filed', companyId },
      { date: new Date('2026-07-05'), ref: 'VAT-005', description: 'Output VAT – Addis Tech – INV-2026-004', taxableAmount: 1200000, vatAmount: 180000, type: 'Output VAT (Sales)', status: 'Pending', companyId },
      { date: new Date('2026-07-06'), ref: 'VAT-006', description: 'Input VAT – Marketing Ads Meta', taxableAmount: 35000, vatAmount: 5250, type: 'Input VAT (Purchases)', status: 'Pending', companyId },
      { date: new Date('2026-07-07'), ref: 'VAT-007', description: 'Output VAT – Blue Nile Exports – INV-2026-005', taxableAmount: 650000, vatAmount: 97500, type: 'Output VAT (Sales)', status: 'Filed', companyId },
      { date: new Date('2026-07-08'), ref: 'VAT-008', description: 'Input VAT – Employee Salaries June 2026', taxableAmount: 267000, vatAmount: 40050, type: 'Input VAT (Purchases)', status: 'Filed', companyId },
    ],
    skipDuplicates: true
  });
  console.log('VAT entries seeded');

  // ── JOURNAL ENTRIES (Manual General Ledger) ─────────────────────
  await prisma.journalEntry.createMany({
    data: [
      { date: new Date('2026-07-01'), ref: 'JV-001', account: '4100 - Sales Revenue', description: 'Monthly revenue recognition – June 2026', debit: 0, credit: 900000, status: 'Posted', companyId },
      { date: new Date('2026-07-01'), ref: 'JV-001', account: '1100 - Accounts Receivable', description: 'Revenue recognition offset', debit: 900000, credit: 0, status: 'Posted', companyId },
      { date: new Date('2026-07-02'), ref: 'JV-002', account: '6100 - Salary Expense', description: 'June 2026 Payroll accrual', debit: 267000, credit: 0, status: 'Posted', companyId },
      { date: new Date('2026-07-02'), ref: 'JV-002', account: '2100 - Salaries Payable', description: 'Payroll liability', debit: 0, credit: 267000, status: 'Posted', companyId },
      { date: new Date('2026-07-03'), ref: 'JV-003', account: '5200 - Cost of Goods Sold', description: 'COGS – Inventory issued for production', debit: 180000, credit: 0, status: 'Posted', companyId },
      { date: new Date('2026-07-03'), ref: 'JV-003', account: '1300 - Inventory Asset', description: 'Inventory reduction', debit: 0, credit: 180000, status: 'Posted', companyId },
      { date: new Date('2026-07-05'), ref: 'JV-004', account: '7000 - Depreciation Expense', description: 'Monthly depreciation – Fixed Assets', debit: 85000, credit: 0, status: 'Posted', companyId },
      { date: new Date('2026-07-05'), ref: 'JV-004', account: '1500 - Accumulated Depreciation', description: 'Asset depreciation offset', debit: 0, credit: 85000, status: 'Posted', companyId },
      { date: new Date('2026-07-07'), ref: 'JV-005', account: '6200 - Rent Expense', description: 'July office rent', debit: 45000, credit: 0, status: 'Draft', companyId },
      { date: new Date('2026-07-07'), ref: 'JV-005', account: '1100 - Cash/Bank', description: 'Rent payment', debit: 0, credit: 45000, status: 'Draft', companyId },
      { date: new Date('2026-07-10'), ref: 'JV-006', account: '6100 - Salary Expense', description: 'July 2026 Payroll – 1st half accrual', debit: 133500, credit: 0, status: 'Posted', companyId },
      { date: new Date('2026-07-10'), ref: 'JV-006', account: '2100 - Salaries Payable', description: 'Payroll liability – 1st half', debit: 0, credit: 133500, status: 'Posted', companyId },
      { date: new Date('2026-07-15'), ref: 'JV-007', account: '4100 - Sales Revenue', description: 'Adjustment – Sales discount (Sunrise PLC)', debit: 25000, credit: 0, status: 'Posted', companyId },
      { date: new Date('2026-07-15'), ref: 'JV-007', account: '1100 - Accounts Receivable', description: 'Sales discount offset', debit: 0, credit: 25000, status: 'Posted', companyId },
      { date: new Date('2026-07-20'), ref: 'JV-008', account: '8100 - Tax Expense – Income Tax', description: 'Q2 2026 estimated income tax provision', debit: 180000, credit: 0, status: 'Posted', companyId },
      { date: new Date('2026-07-20'), ref: 'JV-008', account: '2200 - Income Tax Payable', description: 'Tax liability', debit: 0, credit: 180000, status: 'Posted', companyId },
      { date: new Date('2026-06-30'), ref: 'JV-009', account: '4100 - Sales Revenue', description: 'June 2026 revenue close', debit: 980000, credit: 0, status: 'Posted', companyId },
      { date: new Date('2026-06-30'), ref: 'JV-009', account: '3100 - Retained Earnings', description: 'Revenue close to retained earnings', debit: 0, credit: 980000, status: 'Posted', companyId },
      { date: new Date('2026-06-30'), ref: 'JV-010', account: '3100 - Retained Earnings', description: 'Expense close from June 2026', debit: 520000, credit: 0, status: 'Posted', companyId },
      { date: new Date('2026-06-30'), ref: 'JV-010', account: '6100 - Salary Expense', description: 'Closing entry – salaries', debit: 0, credit: 267000, status: 'Posted', companyId },
      { date: new Date('2026-06-30'), ref: 'JV-010', account: '6200 - Rent Expense', description: 'Closing entry – rent', debit: 0, credit: 45000, status: 'Posted', companyId },
      { date: new Date('2026-06-30'), ref: 'JV-010', account: '8100 - Tax Expense', description: 'Closing entry – tax', debit: 0, credit: 180000, status: 'Posted', companyId },
      { date: new Date('2026-06-30'), ref: 'JV-010', account: '7000 - Depreciation Expense', description: 'Closing entry – depreciation', debit: 0, credit: 28000, status: 'Posted', companyId },
    ],
    skipDuplicates: true
  });
  console.log('Journal entries seeded');

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

  // ── PURCHASES (Purchase Requests) ──────────────────────────────
  await prisma.purchase.createMany({
    data: [
      { purchaseNo: 'PR-2026-001', supplierName: 'Biniam Tesfaye', total: 25000, status: 'ORDERED', notes: 'Office Supplies – 50 items', companyId },
      { purchaseNo: 'PR-2026-002', supplierName: 'Dawit Bekele', total: 280000, status: 'PENDING', notes: 'Laptop Dell i7 – 5 units', companyId },
      { purchaseNo: 'PR-2026-003', supplierName: 'Mekdes Worku', total: 48000, status: 'PENDING', notes: 'Marketing Materials – 100 pcs', companyId },
      { purchaseNo: 'PR-2026-004', supplierName: 'Yonas Alemu', total: 480000, status: 'ORDERED', notes: 'Generator 50KVA', companyId },
      { purchaseNo: 'PR-2026-005', supplierName: 'Abebe Girma', total: 120000, status: 'CANCELLED', notes: 'Accounting Software', companyId },
    ],
    skipDuplicates: true
  });
  console.log('Purchases seeded');

  // ── RFQs ────────────────────────────────────────────────────────
  const v1_rfq = await prisma.vendor.findFirst({ where: { name: 'Ethio Supply Co', companyId } });
  const v2_rfq = await prisma.vendor.findFirst({ where: { name: 'TechParts Ethiopia', companyId } });
  const v3_rfq = await prisma.vendor.findFirst({ where: { name: 'Global Imports PLC', companyId } });
  await prisma.rfq.createMany({
    data: [
      { rfqNo: 'RFQ-2026-001', title: 'Office Supplies Q3', requester: 'Biniam Tesfaye', vendorId: v1_rfq!.id, dueDate: new Date('2026-08-15'), total: 250000, status: 'Sent', companyId },
      { rfqNo: 'RFQ-2026-002', title: 'IT Equipment Bundle', requester: 'Dawit Bekele', vendorId: v2_rfq!.id, dueDate: new Date('2026-08-30'), total: 480000, status: 'Draft', companyId },
      { rfqNo: 'RFQ-2026-003', title: 'Construction Materials', requester: 'Mekdes Worku', vendorId: v3_rfq!.id, dueDate: new Date('2026-09-01'), total: 120000, status: 'Awarded', companyId },
      { rfqNo: 'RFQ-2026-004', title: 'Fleet Maintenance Services', requester: 'Yonas Alemu', vendorId: v1_rfq!.id, dueDate: new Date('2026-09-15'), total: 350000, status: 'Sent', companyId },
    ],
    skipDuplicates: true
  });
  console.log('RFQs seeded');

  // ── TENDERS ─────────────────────────────────────────────────────
  await prisma.tender.createMany({
    data: [
      { tenderNo: 'TNR-001', title: 'Office Furniture Supply', department: 'Administration', issueDate: new Date('2026-06-01'), closingDate: new Date('2026-07-15'), budget: 500000, status: 'Open', companyId },
      { tenderNo: 'TNR-002', title: 'IT Infrastructure Upgrade', department: 'IT', issueDate: new Date('2026-06-10'), closingDate: new Date('2026-07-30'), budget: 1200000, status: 'Open', companyId },
      { tenderNo: 'TNR-003', title: 'Vehicle Fleet Maintenance', department: 'Fleet', issueDate: new Date('2026-05-15'), closingDate: new Date('2026-06-30'), budget: 350000, status: 'Awarded', companyId },
      { tenderNo: 'TNR-004', title: 'Security Systems Installation', department: 'Security', issueDate: new Date('2026-07-01'), closingDate: new Date('2026-08-15'), budget: 850000, status: 'Under Review', companyId },
    ],
    skipDuplicates: true
  });
  console.log('Tenders seeded');

  // ── APPROVAL WORKFLOW ──────────────────────────────────────────
  await prisma.approvalWorkflow.createMany({
    data: [
      { requestNo: 'APR-001', module: 'Purchase', requestedBy: 'Biniam Tesfaye', approver: 'Yonas Alemu', status: 'Pending', companyId },
      { requestNo: 'APR-002', module: 'Contract', requestedBy: 'Mekdes Worku', approver: 'Yonas Alemu', status: 'Approved', companyId },
      { requestNo: 'APR-003', module: 'Tender', requestedBy: 'Dawit Bekele', approver: 'Tigist Haile', status: 'Rejected', companyId },
      { requestNo: 'APR-004', module: 'Purchase', requestedBy: 'Sara Tadesse', approver: 'Tigist Haile', status: 'Pending', companyId },
    ],
    skipDuplicates: true
  });
  console.log('Approval workflows seeded');

  
  // ── MACHINES ──────────────────────────────────────────────────────
  await prisma.machine.createMany({
    data: [
      { machineNo: 'MCH-001', name: 'CNC Milling Machine', model: 'Haas VF-2', status: 'OPERATIONAL', utilization: 85, location: 'Bldg A - Section 1', companyId },
      { machineNo: 'MCH-002', name: 'Injection Molder', model: 'Arburg 320C', status: 'OPERATIONAL', utilization: 72, location: 'Bldg A - Section 2', companyId },
      { machineNo: 'MCH-003', name: 'Packaging Line A', model: 'Bosch P2500', status: 'MAINTENANCE', utilization: 0, location: 'Bldg B', companyId },
      { machineNo: 'MCH-004', name: 'Hydraulic Press', model: 'Mitsubishi MH-500', status: 'IDLE', utilization: 35, location: 'Bldg A - Section 3', companyId },
    ],
    skipDuplicates: true
  });
  console.log('Machines seeded');

  // ── MAINTENANCE RECORDS ──────────────────────────────────────────
  const m1 = await prisma.machine.findFirst({ where: { machineNo: 'MCH-001', companyId } });
  const m3 = await prisma.machine.findFirst({ where: { machineNo: 'MCH-003', companyId } });
  if (m1) {
    await prisma.maintenanceRecord.createMany({
      data: [
        { recordNo: 'MT-001', title: 'Oil Change & Lubrication', machineId: m1.id, type: 'PREVENTIVE', scheduledDate: new Date('2026-07-15'), cost: 15000, status: 'PLANNED', companyId },
        { recordNo: 'MT-002', title: 'Spindle Calibration', machineId: m1.id, type: 'SCHEDULED', scheduledDate: new Date('2026-07-20'), cost: 25000, status: 'PLANNED', companyId },
        { recordNo: 'MT-003', title: 'Belt Replacement', machineId: m3!.id, type: 'CORRECTIVE', scheduledDate: new Date('2026-07-10'), cost: 45000, status: 'IN_PROGRESS', companyId },
      ],
      skipDuplicates: true
    });
  }
  console.log('Maintenance records seeded');

  // ── QUALITY CHECKS ───────────────────────────────────────────────
  const p1_mfg = await prisma.product.findFirst({ where: { sku: 'PRD-001', companyId } });
  const p3_mfg = await prisma.product.findFirst({ where: { sku: 'PRD-003', companyId } });
  await prisma.qualityCheck.createMany({
    data: [
      { checkNo: 'QC-001', productId: p1_mfg!.id, inspector: 'Tigist Haile', result: 'PASS', notes: 'All specifications met – batch approved', checkedAt: new Date('2026-07-05'), companyId },
      { checkNo: 'QC-002', productId: p3_mfg!.id, inspector: 'Dawit Bekele', result: 'REWORK', notes: 'Wall thickness below minimum spec – marked for rework', checkedAt: new Date('2026-07-06'), companyId },
      { checkNo: 'QC-003', productId: p1_mfg!.id, inspector: 'Tigist Haile', result: 'PENDING', notes: 'Awaiting lab analysis results', checkedAt: new Date('2026-07-07'), companyId },
    ],
    skipDuplicates: true
  });
  console.log('Quality checks seeded');

  // ── WORK ORDERS ──────────────────────────────────────────────────
  const p4_mfg = await prisma.product.findFirst({ where: { sku: 'PRD-004', companyId } });
  await prisma.workOrder.createMany({
    data: [
      { orderNumber: 'WO-2026-001', productId: p1_mfg!.id, quantity: 500, status: 'COMPLETED', startDate: new Date('2026-07-01'), endDate: new Date('2026-07-15'), companyId },
      { orderNumber: 'WO-2026-002', productId: p3_mfg!.id, quantity: 200, status: 'IN_PRODUCTION', startDate: new Date('2026-07-10'), companyId },
      { orderNumber: 'WO-2026-003', productId: p4_mfg!.id, quantity: 1000, status: 'PLANNED', startDate: new Date('2026-07-15'), companyId },
    ],
    skipDuplicates: true
  });
  console.log('Work orders seeded');

  // ── PRODUCTION SCHEDULES ─────────────────────────────────────────
  const wo1 = await prisma.workOrder.findFirst({ where: { orderNumber: 'WO-2026-001', companyId } });
  const wo2 = await prisma.workOrder.findFirst({ where: { orderNumber: 'WO-2026-002', companyId } });
  await prisma.productionSchedule.createMany({
    data: [
      { scheduleNo: 'SCH-001', workOrderId: wo1!.id, machineId: m1!.id, priority: 'HIGH', startDate: new Date('2026-07-01'), endDate: new Date('2026-07-05'), status: 'COMPLETED', companyId },
      { scheduleNo: 'SCH-002', workOrderId: wo2!.id, machineId: m3!.id, priority: 'MEDIUM', startDate: new Date('2026-07-06'), endDate: new Date('2026-07-12'), status: 'SCHEDULED', companyId },
    ],
    skipDuplicates: true
  });
  console.log('Production schedules seeded');

  // ── BILLS OF MATERIALS ───────────────────────────────────────────
  await prisma.billOfMaterial.createMany({
    data: [
      { name: 'Teff Flour Blend BOM', productId: p1_mfg!.id, version: '1.0', totalCost: 450000, status: 'ACTIVE', companyId },
      { name: 'Coffee Export Pack BOM', productId: p4_mfg!.id, version: '2.0', totalCost: 520000, status: 'ACTIVE', companyId },
    ],
    skipDuplicates: true
  });
  console.log('Bill of materials seeded');
  console.log('\n✅ All CRM & Finance & Inventory & Procurement & Manufacturing data seeded successfully!');
}

main().catch(e => { console.error(e); process.exit(1); });
