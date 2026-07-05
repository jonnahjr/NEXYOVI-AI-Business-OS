import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required in .env');
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

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

  console.log(`Seeding HR Mega Expansion records for company: ${company.name}`);

  // Create an employee if none exists
  let employee = await prisma.employee.findFirst({ where: { companyId } });
  if (!employee) {
    // Need a user first
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'hr.test@nexyovi.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          role: 'EMPLOYEE',
          companyId,
        }
      });
    }
    employee = await prisma.employee.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        employeeCode: 'EMP-001',
        jobTitle: 'Software Engineer',
        salary: 80000,
        userId: user.id,
        companyId,
      }
    });
  }
  const employeeId = employee.id;

  // Mock RecruitmentCandidate
  await prisma.recruitmentCandidate.createMany({
    data: [
      { name: 'Alice Smith', email: 'alice@example.com', position: 'Senior Developer', stage: 'INTERVIEW', rating: 4, companyId },
      { name: 'Bob Jones', email: 'bob@example.com', position: 'Product Manager', stage: 'APPLIED', rating: 0, companyId },
      { name: 'Charlie Brown', email: 'charlie@example.com', position: 'Designer', stage: 'OFFER', rating: 5, companyId }
    ],
    skipDuplicates: true,
  });

  // Mock OnboardingTask
  await prisma.onboardingTask.createMany({
    data: [
      { title: 'Setup laptop and accounts', status: 'COMPLETED', employeeId, companyId },
      { title: 'Read employee handbook', status: 'IN_PROGRESS', employeeId, companyId },
      { title: 'Meet with HR manager', status: 'PENDING', employeeId, companyId }
    ],
    skipDuplicates: true,
  });

  // Mock PerformanceReview
  await prisma.performanceReview.create({
    data: { period: 'Q2 2026', score: 4.5, feedback: 'Excellent work on the AI core integration.', employeeId, companyId }
  });

  // Mock TrainingCourse
  await prisma.trainingCourse.createMany({
    data: [
      { title: 'Advanced NextJS Routing', instructor: 'Vercel Team', durationHrs: 4, companyId },
      { title: 'Leadership 101', instructor: 'HR Dept', durationHrs: 2, companyId },
      { title: 'Cybersecurity Basics', instructor: 'IT Dept', durationHrs: 1, companyId }
    ],
    skipDuplicates: true,
  });

  // Mock EmployeeBenefit
  await prisma.employeeBenefit.createMany({
    data: [
      { name: 'Premium Health Insurance', type: 'HEALTH', provider: 'BlueCross', cost: 400, employeeId, companyId },
      { name: '401k Match', type: 'RETIREMENT', provider: 'Fidelity', cost: 200, employeeId, companyId },
      { name: 'Gym Membership', type: 'PERK', provider: 'Anytime Fitness', cost: 50, employeeId, companyId }
    ],
    skipDuplicates: true,
  });

  // Mock TimeSheet
  await prisma.timeSheet.createMany({
    data: [
      { date: new Date('2026-07-01'), hoursWorked: 8, task: 'Frontend Dev', employeeId, companyId },
      { date: new Date('2026-07-02'), hoursWorked: 8.5, task: 'Backend Integration', employeeId, companyId },
      { date: new Date('2026-07-03'), hoursWorked: 7.5, task: 'Testing', employeeId, companyId }
    ],
    skipDuplicates: true,
  });

  // Mock ShiftSchedule
  await prisma.shiftSchedule.createMany({
    data: [
      { shiftName: 'Morning Shift', startTime: new Date('2026-07-06T08:00:00Z'), endTime: new Date('2026-07-06T16:00:00Z'), location: 'HQ', employeeId, companyId },
      { shiftName: 'Morning Shift', startTime: new Date('2026-07-07T08:00:00Z'), endTime: new Date('2026-07-07T16:00:00Z'), location: 'HQ', employeeId, companyId },
      { shiftName: 'Night Shift', startTime: new Date('2026-07-08T20:00:00Z'), endTime: new Date('2026-07-09T04:00:00Z'), location: 'Remote', employeeId, companyId }
    ],
    skipDuplicates: true,
  });

  // Mock ExitInterview
  await prisma.exitInterview.create({
    data: { exitDate: new Date('2026-08-01'), reason: 'Relocation', feedback: 'Great company, enjoyed my time here.', employeeId, companyId }
  });

  // Mock HrAnalyticsMetric
  await prisma.hrAnalyticsMetric.createMany({
    data: [
      { metricName: 'Employee Retention Rate', value: 92.5, companyId },
      { metricName: 'Time to Hire (Days)', value: 18.2, companyId },
      { metricName: 'Training Completion Rate', value: 85.0, companyId }
    ],
    skipDuplicates: true,
  });

  // Mock HrHelpRequest
  await prisma.hrHelpRequest.createMany({
    data: [
      { subject: 'Tax Form Query', description: 'How do I update my W4?', category: 'PAYROLL', employeeId, companyId },
      { subject: 'Missing Monitor', description: 'I need a second monitor for my desk.', category: 'IT_SUPPORT', employeeId, companyId },
      { subject: 'PTO Question', description: 'Can I carry over my unused PTO?', category: 'LEAVE', employeeId, companyId }
    ],
    skipDuplicates: true,
  });

  console.log('Seeding complete for HR!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
