import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$connect();
  const employees = await prisma.employee.findMany();
  console.log(`Found ${employees.length} employees`);

  let updated = 0;
  for (const emp of employees) {
    if (Number(emp.annualLeaveBalance) > 0) {
      console.log(`  Skipping ${emp.firstName} ${emp.lastName} — already has balances`);
      continue;
    }

    await prisma.employee.update({
      where: { id: emp.id },
      data: {
        annualLeaveBalance: 21,
        sickLeaveBalance: 14,
        maternityLeave: 0,
        paternityLeave: 0,
        unpaidLeaveBalance: 0,
        compassionateLeave: 0,
      },
    });
    console.log(`  Updated ${emp.firstName} ${emp.lastName} — set 21 Annual, 14 Sick`);
    updated++;
  }

  console.log(`\nDone! ${updated} employees updated with leave balances.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
