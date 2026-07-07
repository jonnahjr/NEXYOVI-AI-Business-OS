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
    console.log('No company found. Creating Nexyovi AI mock company...');
    company = await prisma.company.create({
      data: { name: 'Nexyovi Enterprise', slug: 'nexyovi-enterprise', industry: 'Software', isActive: true }
    });
  }
  const companyId = company.id;

  console.log(`Seeding org chart for: ${company.name}`);

  // ── Ensure Departments ──────────────────────────────────
  const departments: Record<string, string> = {};
  const deptNames = [
    'Executive', 'Engineering', 'Product', 'Design', 'Marketing', 'Sales',
    'Finance', 'Human Resources', 'Operations', 'Customer Success', 'Legal', 'IT',
  ];
  for (const name of deptNames) {
    let dept = await prisma.department.findFirst({ where: { name, companyId } });
    if (!dept) {
      dept = await prisma.department.create({ data: { name, companyId } });
    }
    departments[name] = dept.id;
  }

  // ── Ensure Users for employees ──────────────────────────
  async function ensureUser(email: string, firstName: string, lastName: string, role: string = 'EMPLOYEE') {
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, password: 'ChangeMe@123', firstName, lastName, role: role as any, companyId }
      });
    }
    return user;
  }

  // ── Ensure Employee (find by employeeCode or create) ─────
  async function ensureEmployee(
    code: string, firstName: string, lastName: string, jobTitle: string,
    departmentName: string, salary: number = 0, managerCode?: string
  ) {
    let emp = await prisma.employee.findFirst({ where: { employeeCode: code, companyId } });
    if (!emp) {
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@nexyovi.com`;
      const user = await ensureUser(email, firstName, lastName);
      const deptId = departments[departmentName];
      let managerId: string | undefined;
      if (managerCode) {
        const mgr = await prisma.employee.findFirst({ where: { employeeCode: managerCode, companyId } });
        if (mgr) managerId = mgr.id;
      }
      emp = await prisma.employee.create({
        data: {
          employeeCode: code, firstName, lastName, jobTitle,
          salary, companyId, userId: user.id,
          departmentId: deptId,
          managerId,
          hireDate: new Date('2022-01-01'),
          status: 'ACTIVE',
          employmentType: 'FULL_TIME',
        }
      });
      console.log(`  Created: ${firstName} ${lastName} (${code}) → ${jobTitle}`);
    }
    return emp;
  }

  // ═══════════════════════════════════════════════════════════
  // ORG CHART HIERARCHY
  // ═══════════════════════════════════════════════════════════

  // ── C-Suite ──────────────────────────────────────────
  await ensureEmployee('EXEC-001', 'Amanuel', 'Tekle', 'Chief Executive Officer (CEO)', 'Executive', 250000);
  await ensureEmployee('EXEC-002', 'Meron', 'Assefa', 'Chief Operating Officer (COO)', 'Executive', 200000, 'EXEC-001');
  await ensureEmployee('EXEC-003', 'Bruktawit', 'Lemma', 'Chief Technology Officer (CTO)', 'Executive', 220000, 'EXEC-001');
  await ensureEmployee('EXEC-004', 'Henok', 'Wolde', 'Chief Financial Officer (CFO)', 'Executive', 210000, 'EXEC-001');
  await ensureEmployee('EXEC-005', 'Selamawit', 'Desta', 'Chief Marketing Officer (CMO)', 'Executive', 190000, 'EXEC-001');
  await ensureEmployee('EXEC-006', 'Yonas', 'Alemu', 'Chief Revenue Officer (CRO)', 'Executive', 195000, 'EXEC-001');

  // ── Engineering (under CTO) ────────────────────────────
  await ensureEmployee('ENG-001', 'Dawit', 'Bekele', 'VP of Engineering', 'Engineering', 160000, 'EXEC-003');
  await ensureEmployee('ENG-002', 'Tsion', 'Belay', 'Engineering Manager (Backend)', 'Engineering', 120000, 'ENG-001');
  await ensureEmployee('ENG-003', 'Mulugeta', 'Girma', 'Engineering Manager (Frontend)', 'Engineering', 120000, 'ENG-001');
  await ensureEmployee('ENG-004', 'Hanna', 'Gebre', 'Senior Backend Engineer', 'Engineering', 95000, 'ENG-002');
  await ensureEmployee('ENG-005', 'Fitsum', 'Tadesse', 'Backend Engineer', 'Engineering', 75000, 'ENG-002');
  await ensureEmployee('ENG-006', 'Liya', 'Kebede', 'Backend Engineer', 'Engineering', 72000, 'ENG-002');
  await ensureEmployee('ENG-007', 'Natnael', 'Wondimu', 'Senior Frontend Engineer', 'Engineering', 95000, 'ENG-003');
  await ensureEmployee('ENG-008', 'Ruth', 'Belete', 'Frontend Engineer', 'Engineering', 72000, 'ENG-003');
  await ensureEmployee('ENG-009', 'Abenezer', 'Tilahun', 'Frontend Engineer', 'Engineering', 68000, 'ENG-003');
  await ensureEmployee('ENG-010', 'Betelhem', 'Zewdie', 'DevOps Engineer', 'Engineering', 88000, 'ENG-001');
  await ensureEmployee('ENG-011', 'Eden', 'Negash', 'QA Engineer', 'Engineering', 65000, 'ENG-001');

  // ── Product (under COO) ──────────────────────────────
  await ensureEmployee('PROD-001', 'Tigist', 'Haile', 'VP of Product', 'Product', 150000, 'EXEC-002');
  await ensureEmployee('PROD-002', 'Samson', 'Wondimu', 'Senior Product Manager', 'Product', 110000, 'PROD-001');
  await ensureEmployee('PROD-003', 'Meron', 'Gizaw', 'Product Manager', 'Product', 90000, 'PROD-002');
  await ensureEmployee('PROD-004', 'Biruk', 'Dagne', 'Product Analyst', 'Product', 70000, 'PROD-002');

  // ── Design (under Product) ───────────────────────────
  await ensureEmployee('DSGN-001', 'Winta', 'Tadesse', 'Design Director', 'Design', 130000, 'PROD-001');
  await ensureEmployee('DSGN-002', 'Meklit', 'Assefa', 'Senior UI/UX Designer', 'Design', 95000, 'DSGN-001');
  await ensureEmployee('DSGN-003', 'Dagim', 'Hailemariam', 'UI/UX Designer', 'Design', 72000, 'DSGN-002');
  await ensureEmployee('DSGN-004', 'Nardos', 'Tesfaye', 'Graphic Designer', 'Design', 60000, 'DSGN-001');

  // ── Marketing (under CMO) ─────────────────────────
  await ensureEmployee('MKT-001', 'Bisrat', 'Habte', 'Marketing Director', 'Marketing', 130000, 'EXEC-005');
  await ensureEmployee('MKT-002', 'Mekdes', 'Worku', 'Senior Marketing Specialist', 'Marketing', 90000, 'MKT-001');
  await ensureEmployee('MKT-003', 'Yonatan', 'Kassa', 'Content Strategist', 'Marketing', 75000, 'MKT-002');
  await ensureEmployee('MKT-004', 'Selam', 'Hailu', 'Social Media Manager', 'Marketing', 68000, 'MKT-002');
  await ensureEmployee('MKT-005', 'Bereket', 'Mengistu', 'Marketing Analyst', 'Marketing', 65000, 'MKT-001');

  // ── Sales (under CRO) ─────────────────────────────
  await ensureEmployee('SAL-001', 'Sara', 'Tadesse', 'Sales Director', 'Sales', 140000, 'EXEC-006');
  await ensureEmployee('SAL-002', 'Ermias', 'Worku', 'Senior Account Executive', 'Sales', 100000, 'SAL-001');
  await ensureEmployee('SAL-003', 'Zerihun', 'Gebremedhin', 'Account Executive', 'Sales', 80000, 'SAL-002');
  await ensureEmployee('SAL-004', 'Bethelihem', 'Asrat', 'Sales Development Rep', 'Sales', 60000, 'SAL-002');
  await ensureEmployee('SAL-005', 'Mintesinot', 'Debebe', 'Sales Operations', 'Sales', 72000, 'SAL-001');

  // ── Finance (under CFO) ───────────────────────────
  await ensureEmployee('FIN-001', 'Abebe', 'Girma', 'Finance Director', 'Finance', 140000, 'EXEC-004');
  await ensureEmployee('FIN-002', 'Hana', 'Bekele', 'Senior Accountant', 'Finance', 95000, 'FIN-001');
  await ensureEmployee('FIN-003', 'Ephrem', 'Wondimu', 'Financial Analyst', 'Finance', 78000, 'FIN-002');
  await ensureEmployee('FIN-004', 'Blaine', 'Mekonnen', 'Accounts Payable', 'Finance', 60000, 'FIN-002');
  await ensureEmployee('FIN-005', 'Kidist', 'Haile', 'Tax Specialist', 'Finance', 82000, 'FIN-001');

  // ── Human Resources (under COO) ──────────────────
  await ensureEmployee('HR-001', 'Azeb', 'Welde', 'VP of Human Resources', 'Human Resources', 145000, 'EXEC-002');
  await ensureEmployee('HR-002', 'Mahlet', 'Girma', 'HR Manager', 'Human Resources', 95000, 'HR-001');
  await ensureEmployee('HR-003', 'Frehiwot', 'Tesfaye', 'HR Generalist', 'Human Resources', 70000, 'HR-002');
  await ensureEmployee('HR-004', 'Meron', 'Alemu', 'Recruitment Lead', 'Human Resources', 88000, 'HR-001');
  await ensureEmployee('HR-005', 'Sosina', 'Mekonnen', 'Talent Acquisition Specialist', 'Human Resources', 65000, 'HR-004');
  await ensureEmployee('HR-006', 'Betty', 'Wondimu', 'Payroll Specialist', 'Human Resources', 68000, 'HR-002');

  // ── Operations (under COO) ─────────────────────────
  await ensureEmployee('OPS-001', 'Yonatan', 'Alemu', 'Operations Director', 'Operations', 135000, 'EXEC-002');
  await ensureEmployee('OPS-002', 'Biniam', 'Tesfaye', 'Facilities Manager', 'Operations', 80000, 'OPS-001');
  await ensureEmployee('OPS-003', 'Arsema', 'Tekola', 'Office Administrator', 'Operations', 55000, 'OPS-002');
  await ensureEmployee('OPS-004', 'Melaku', 'Eshete', 'Supply Chain Lead', 'Operations', 85000, 'OPS-001');
  await ensureEmployee('OPS-005', 'Tsion', 'Kebede', 'Logistics Coordinator', 'Operations', 62000, 'OPS-004');

  // ── Customer Success (under CRO) ────────────────────
  await ensureEmployee('CS-001', 'Rahel', 'Tadesse', 'VP of Customer Success', 'Customer Success', 140000, 'EXEC-006');
  await ensureEmployee('CS-002', 'Yidnekachew', 'Desta', 'Customer Success Manager', 'Customer Success', 88000, 'CS-001');
  await ensureEmployee('CS-003', 'Saba', 'Gebre', 'Customer Success Associate', 'Customer Success', 62000, 'CS-002');
  await ensureEmployee('CS-004', 'Tewodros', 'Mengistu', 'Support Lead', 'Customer Success', 75000, 'CS-001');
  await ensureEmployee('CS-005', 'Mahider', 'Assefa', 'Support Specialist', 'Customer Success', 55000, 'CS-004');

  // ── Legal (under CEO) ────────────────────────────
  await ensureEmployee('LEG-001', 'Estifanos', 'Girma', 'General Counsel', 'Legal', 180000, 'EXEC-001');
  await ensureEmployee('LEG-002', 'Nebiyat', 'Ayele', 'Corporate Counsel', 'Legal', 110000, 'LEG-001');
  await ensureEmployee('LEG-003', 'Eyerusalem', 'Fanta', 'Contract Specialist', 'Legal', 72000, 'LEG-002');

  // ── IT (under CTO) ─────────────────────────────────
  await ensureEmployee('IT-001', 'Henok', 'Teshome', 'IT Director', 'IT', 125000, 'EXEC-003');
  await ensureEmployee('IT-002', 'Yohannes', 'Mamo', 'IT Support Manager', 'IT', 85000, 'IT-001');
  await ensureEmployee('IT-003', 'Filmon', 'Gebreselassie', 'IT Support Specialist', 'IT', 55000, 'IT-002');
  await ensureEmployee('IT-004', 'Surafel', 'Worku', 'Network Administrator', 'IT', 72000, 'IT-001');
  await ensureEmployee('IT-005', 'Nahom', 'Kebede', 'Security Analyst', 'IT', 90000, 'IT-001');

  console.log(`\n✅ Org chart seeded: ${deptNames.length} departments across ${await prisma.employee.count({ where: { companyId } })} employees`);
}

main().catch(e => { console.error(e); process.exit(1); });
