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

  console.log('🗑️  Wiping all data from Supabase (fresh start)...');

  // Delete in dependency order (children before parents)
  await prisma.hrHelpRequest.deleteMany();
  await prisma.hrAnalyticsMetric.deleteMany();
  await prisma.exitInterview.deleteMany();
  await prisma.shiftSchedule.deleteMany();
  await prisma.timeSheet.deleteMany();
  await prisma.employeeBenefit.deleteMany();
  await prisma.trainingCourse.deleteMany();
  await prisma.performanceReview.deleteMany();
  await prisma.onboardingTask.deleteMany();
  await prisma.recruitmentCandidate.deleteMany();
  await prisma.aiDecisionLog.deleteMany();
  await prisma.aiAutomationTask.deleteMany();
  await prisma.aiAnalyticsMetric.deleteMany();
  await prisma.aiDocumentJob.deleteMany();
  await prisma.aiKnowledgeSource.deleteMany();
  await prisma.aiVoiceCall.deleteMany();
  await prisma.aiWorkflow.deleteMany();
  await prisma.aiCopilotSession.deleteMany();
  await prisma.aiCeoObjective.deleteMany();
  await prisma.aiAgentLog.deleteMany();
  await prisma.aiAgent.deleteMany();
  await prisma.demoRequest.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.fixedAsset.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.marketingCampaign.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.report.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.document.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.product.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.leave.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();

  console.log('✅ All data cleared! Database is fresh at 0 records.');
  console.log('   Company and User accounts preserved.');

  await pool.end();
}

main().catch((e) => {
  console.error('❌ Error during reset:', e);
  process.exit(1);
});
