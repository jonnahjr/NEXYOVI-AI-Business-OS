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

  // Mock HrAnalyticsMetric — comprehensive HR KPIs across all domains
  await prisma.hrAnalyticsMetric.createMany({
    data: [
      // ── Workforce & Headcount ────────────────────────────────────
      { metricName: 'Total Employees', value: 248, companyId },
      { metricName: 'Active Employees', value: 234, companyId },
      { metricName: 'Headcount (Full-Time)', value: 198, companyId },
      { metricName: 'Headcount (Part-Time)', value: 28, companyId },
      { metricName: 'Headcount (Contract)', value: 22, companyId },
      { metricName: 'New Hires (This Month)', value: 6, companyId },
      { metricName: 'Department Count', value: 12, companyId },

      // ── Turnover & Attrition ─────────────────────────────────────
      { metricName: 'Employee Turnover Rate (%)', value: 14.2, companyId },
      { metricName: 'Voluntary Turnover Rate (%)', value: 10.5, companyId },
      { metricName: 'Involuntary Turnover Rate (%)', value: 3.7, companyId },
      { metricName: 'Monthly Attrition Rate (%)', value: 1.8, companyId },
      { metricName: 'Employee Retention Rate (%)', value: 85.8, companyId },
      { metricName: 'Employees Exited (This Year)', value: 18, companyId },
      { metricName: 'Regrettable Turnover (%)', value: 4.2, companyId },

      // ── Tenure & Experience ──────────────────────────────────────
      { metricName: 'Average Tenure (Years)', value: 3.8, companyId },
      { metricName: 'Median Tenure (Years)', value: 2.5, companyId },
      { metricName: 'Tenure < 1 Year (%)', value: 22, companyId },
      { metricName: 'Tenure 1-3 Years (%)', value: 35, companyId },
      { metricName: 'Tenure 3-5 Years (%)', value: 26, companyId },
      { metricName: 'Tenure 5+ Years (%)', value: 17, companyId },
      { metricName: 'Average Employee Age', value: 31.4, companyId },

      // ── Recruitment & Hiring ─────────────────────────────────────
      { metricName: 'Time to Hire (Days)', value: 18.2, companyId },
      { metricName: 'Time to Fill (Days)', value: 32.5, companyId },
      { metricName: 'Cost per Hire (ETB)', value: 28500, companyId },
      { metricName: 'Offer Acceptance Rate (%)', value: 87.3, companyId },
      { metricName: 'Open Positions', value: 14, companyId },
      { metricName: 'Applicants per Opening', value: 42, companyId },
      { metricName: 'Source (Referral) (%)', value: 38, companyId },
      { metricName: 'Source (Job Board) (%)', value: 32, companyId },
      { metricName: 'Source (LinkedIn) (%)', value: 22, companyId },
      { metricName: 'Source (Other) (%)', value: 8, companyId },

      // ── Attendance & Absenteeism ─────────────────────────────────
      { metricName: 'Absenteeism Rate (%)', value: 3.2, companyId },
      { metricName: 'Average Days Absent (Annual)', value: 8.5, companyId },
      { metricName: 'Average Hours Worked (Daily)', value: 8.1, companyId },
      { metricName: 'Attendance Rate (%)', value: 94.8, companyId },
      { metricName: 'Late Arrivals (This Month)', value: 23, companyId },
      { metricName: 'Overtime Hours (This Month)', value: 342, companyId },
      { metricName: 'Sick Leave Usage (Days/Employee)', value: 4.2, companyId },

      // ── Payroll & Compensation ───────────────────────────────────
      { metricName: 'Average Monthly Salary (ETB)', value: 38400, companyId },
      { metricName: 'Median Monthly Salary (ETB)', value: 32000, companyId },
      { metricName: 'Total Monthly Payroll (ETB)', value: 9523200, companyId },
      { metricName: 'Annual Payroll Cost (ETB)', value: 114278400, companyId },
      { metricName: 'Salary Competitiveness Ratio (%)', value: 92, companyId },
      { metricName: 'Bonus Payout Rate (%)', value: 78, companyId },
      { metricName: 'Benefits Cost per Employee (ETB)', value: 12400, companyId },

      // ── Performance Management ───────────────────────────────────
      { metricName: 'Average Performance Score', value: 3.8, companyId },
      { metricName: 'Top Performers (Score >= 4.5) (%)', value: 22, companyId },
      { metricName: 'Performance Review Completion (%)', value: 91, companyId },
      { metricName: 'Employees on PIP (%)', value: 3.5, companyId },
      { metricName: 'Promotions (This Year)', value: 16, companyId },
      { metricName: 'Internal Hire Rate (%)', value: 34, companyId },

      // ── Learning & Development ───────────────────────────────────
      { metricName: 'Training Completion Rate (%)', value: 85, companyId },
      { metricName: 'Average Training Hours (Annual)', value: 24.5, companyId },
      { metricName: 'Training Satisfaction Score', value: 4.2, companyId },
      { metricName: 'Employees Certified (%)', value: 41, companyId },
      { metricName: 'L&D Spend per Employee (ETB)', value: 8500, companyId },
      { metricName: 'eLearning Course Completion (%)', value: 72, companyId },

      // ── Diversity & Inclusion ────────────────────────────────────
      { metricName: 'Gender Diversity (Female %)', value: 44, companyId },
      { metricName: 'Gender Diversity (Male %)', value: 56, companyId },
      { metricName: 'Management (Female %)', value: 38, companyId },
      { metricName: 'Management (Male %)', value: 62, companyId },
      { metricName: 'Nationalities Represented', value: 8, companyId },
      { metricName: 'Age Diversity Index', value: 0.72, companyId },

      // ── Employee Engagement & Satisfaction ────────────────────────
      { metricName: 'eNPS (Employee Net Promoter Score)', value: 42, companyId },
      { metricName: 'Employee Satisfaction Score', value: 3.9, companyId },
      { metricName: 'Survey Participation Rate (%)', value: 76, companyId },
      { metricName: 'Employee Referral Rate (%)', value: 18, companyId },
      { metricName: 'Exit Interview Satisfaction', value: 3.5, companyId },
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
