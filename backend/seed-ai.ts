import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // Get the first company to attach records to
  let company = await prisma.company.findFirst();
  if (!company) {
    console.log('No company found. Creating Nexyovi AI mock company...');
    company = await prisma.company.create({
      data: {
        name: 'Nexyovi Enterprise',
        slug: 'nexyovi-enterprise',
        industry: 'Software',
        isActive: true,
      }
    });
  }
  const companyId = company.id;

  console.log(`Seeding AI Core records for company: ${company.name}`);

  // 1. AI CEO
  await prisma.aiCeoObjective.create({
    data: { title: 'Increase Q3 Revenue by 15%', description: 'Strategic objective to drive sales in emerging markets.', targetValue: 15, currentValue: 12.5, status: 'ON_TRACK', companyId }
  });
  // 2. AI Copilot
  await prisma.aiCopilotSession.create({
    data: { title: 'Analyze Q2 Marketing Spend', summary: 'Copilot suggested reallocating 20% budget to Social Media.', tokensUsed: 4250, companyId }
  });
  // 3. AI Agents
  await prisma.aiAgent.create({
    data: { name: 'Sales Copilot', role: 'Outbound SDR', model: 'gemini-2.0-flash', status: 'RUNNING', tasksDone: 142, companyId }
  });
  // 4. AI Workflow Builder
  await prisma.aiWorkflow.create({
    data: { name: 'Invoice Approval Automator', description: 'Automatically approves invoices under $500.', triggerType: 'ON_INVOICE_CREATED', status: 'ACTIVE', companyId }
  });
  // 5. AI Voice Assistant
  await prisma.aiVoiceCall.create({
    data: { callerId: '+1 555-0198', intent: 'Customer Support / Refund', durationSec: 124, status: 'COMPLETED', transcript: 'Customer asked for a refund. AI processed it successfully.', companyId }
  });
  // 6. AI Knowledge Base
  await prisma.aiKnowledgeSource.create({
    data: { title: 'Employee Handbook 2026', type: 'DOCUMENT', status: 'SYNCED', chunkCount: 128, companyId }
  });
  // 7. AI Document Intelligence
  await prisma.aiDocumentJob.create({
    data: { fileName: 'Vendor_Invoice_492.pdf', fileUrl: 'https://storage/vendor_invoice_492.pdf', status: 'COMPLETED', extractedData: { total: 450.00, date: '2026-07-01' }, confidence: 0.98, companyId }
  });
  // 8. AI Analytics
  await prisma.aiAnalyticsMetric.create({
    data: { metricName: 'Total Tokens Generated (Monthly)', value: 1250000, companyId }
  });
  // 9. AI Automation
  await prisma.aiAutomationTask.create({
    data: { taskName: 'Sync CRM leads from Website', status: 'SUCCESS', executionTimeMs: 450, companyId }
  });
  // 10. AI Decision Engine
  await prisma.aiDecisionLog.create({
    data: { context: 'Warehouse A is running low on Product XYZ', recommendation: 'Reorder 500 units from Vendor B immediately to avoid stockout.', confidenceScore: 0.94, status: 'APPROVED', companyId }
  });

  console.log('Seeding complete!');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
