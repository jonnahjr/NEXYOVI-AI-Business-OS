import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanEmployees() {
  const allEmployees = await prisma.employee.findMany({
    orderBy: { createdAt: 'desc' }
  });

  console.log(`Found ${allEmployees.length} employees total.`);
  
  // The user says "i add 1 and 1 test toatl 2... only keep i uploade and when i referesh i see 2"
  // So we keep the newest 2 employees and delete the rest.
  if (allEmployees.length > 2) {
    const toDelete = allEmployees.slice(2);
    console.log(`Deleting ${toDelete.length} older employees...`);
    
    for (const emp of toDelete) {
      await prisma.employee.delete({
        where: { id: emp.id }
      });
      console.log(`Deleted employee ${emp.firstName} ${emp.lastName} (${emp.id})`);
      
      // Also clean up the auto-generated User if they were created specifically for this employee
      // But Cascade might handle that, or we can just leave the User since it's an employee mapping issue.
      // Prisma schema says: user User @relation(fields: [userId], references: [id], onDelete: Cascade)
      // Actually, wait! The Cascade is on Employee -> User, meaning if User is deleted, Employee is deleted. 
      // Deleting the Employee will NOT delete the User. That's fine.
    }
  } else {
    console.log('No extra employees to delete.');
  }

  // Print remaining
  const remaining = await prisma.employee.findMany({
    orderBy: { createdAt: 'desc' }
  });
  console.log('\nRemaining Employees:');
  remaining.forEach(e => {
    console.log(`- ${e.firstName} ${e.lastName} (ID: ${e.id}, Code: ${e.employeeCode})`);
  });

  await prisma.$disconnect();
}

cleanEmployees().catch(e => {
  console.error(e);
  process.exit(1);
});
