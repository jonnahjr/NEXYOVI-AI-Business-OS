import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HrService {
  constructor(private prisma: PrismaService) {}

  // ─── DEPARTMENTS ───────────────────────────────────────────────
  async getDepartments(companyId: string) {
    return this.prisma.department.findMany({
      where: { companyId },
      include: { _count: { select: { employees: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createDepartment(companyId: string, data: { name: string; description?: string }) {
    return this.prisma.department.create({ data: { ...data, companyId } });
  }

  async updateDepartment(id: string, data: { name?: string; description?: string }) {
    return this.prisma.department.update({ where: { id }, data });
  }

  async deleteDepartment(id: string) {
    return this.prisma.department.delete({ where: { id } });
  }

  // ─── EMPLOYEES ─────────────────────────────────────────────────
  async getEmployees(companyId: string) {
    return this.prisma.employee.findMany({
      where: { companyId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true, phone: true } },
        department: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEmployee(id: string) {
    const emp = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true, phone: true, role: true } },
        department: true,
        attendances: { orderBy: { date: 'desc' }, take: 30 },
        leaves: { orderBy: { startDate: 'desc' } },
        payrolls: { orderBy: { year: 'desc' } },
      },
    });
    if (!emp) throw new NotFoundException('Employee not found');
    return emp;
  }

  async updateEmployee(id: string, data: any) {
    return this.prisma.employee.update({ where: { id }, data });
  }

  // ─── ATTENDANCE ─────────────────────────────────────────────────
  async getAttendance(companyId: string, date?: string) {
    const where: any = {
      employee: { companyId },
    };
    if (date) where.date = new Date(date);
    return this.prisma.attendance.findMany({
      where,
      include: {
        employee: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async markAttendance(employeeId: string, data: { date: string; checkIn?: string; checkOut?: string; status: any; notes?: string }) {
    return this.prisma.attendance.upsert({
      where: { id: `${employeeId}-${data.date}` },
      create: {
        employeeId,
        date: new Date(data.date),
        checkIn: data.checkIn ? new Date(data.checkIn) : undefined,
        checkOut: data.checkOut ? new Date(data.checkOut) : undefined,
        status: data.status,
        notes: data.notes,
      },
      update: {
        checkIn: data.checkIn ? new Date(data.checkIn) : undefined,
        checkOut: data.checkOut ? new Date(data.checkOut) : undefined,
        status: data.status,
      },
    });
  }

  // ─── LEAVES ────────────────────────────────────────────────────
  async getLeaves(companyId: string) {
    return this.prisma.leave.findMany({
      where: { employee: { companyId } },
      include: {
        employee: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createLeave(data: { employeeId: string; type: any; startDate: string; endDate: string; reason?: string }) {
    return this.prisma.leave.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
    });
  }

  async updateLeaveStatus(id: string, status: any) {
    return this.prisma.leave.update({ where: { id }, data: { status } });
  }

  // ─── PAYROLL ────────────────────────────────────────────────────
  async getPayrolls(companyId: string, year?: number) {
    return this.prisma.payroll.findMany({
      where: { employee: { companyId }, ...(year ? { year } : {}) },
      include: {
        employee: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async generatePayroll(companyId: string, month: number, year: number) {
    const employees = await this.prisma.employee.findMany({ where: { companyId, status: 'ACTIVE' } });
    const results: any[] = [];
    for (const emp of employees) {
      const tax = emp.salary * 0.15;
      const net = emp.salary - tax;
      const payroll = await this.prisma.payroll.upsert({
        where: { id: `${emp.id}-${month}-${year}` },
        create: { employeeId: emp.id, month, year, baseSalary: emp.salary, tax, netSalary: net },
        update: { baseSalary: emp.salary, tax, netSalary: net },
      });
      results.push(payroll);
    }
    return results;
  }

  async approvePayroll(id: string) {
    return this.prisma.payroll.update({ where: { id }, data: { status: 'APPROVED' } });
  }

  // ─── DASHBOARD STATS ───────────────────────────────────────────
  async getHrStats(companyId: string) {
    const [totalEmployees, activeEmployees, departments, pendingLeaves] = await Promise.all([
      this.prisma.employee.count({ where: { companyId } }),
      this.prisma.employee.count({ where: { companyId, status: 'ACTIVE' } }),
      this.prisma.department.count({ where: { companyId } }),
      this.prisma.leave.count({ where: { employee: { companyId }, status: 'PENDING' } }),
    ]);
    return { totalEmployees, activeEmployees, departments, pendingLeaves };
  }
  // ─── GENERIC HR MODULE ENDPOINTS ──────────────────────────────
  async getHrModuleData(moduleSlug: string, companyId: string) {
    switch (moduleSlug) {
      case "employee-management":    return this.prisma.employee.findMany({ where: { companyId }, include: { user: { select: { firstName: true, lastName: true } }, department: { select: { name: true } } } });
      case "recruitment-ats":        return this.prisma.recruitmentCandidate.findMany({ where: { companyId } });
      case "onboarding":             return this.prisma.onboardingTask.findMany({ where: { companyId } });
      case "attendance":             return this.prisma.attendance.findMany({ where: { employee: { companyId } }, include: { employee: { include: { user: { select: { firstName: true, lastName: true } } } } } });
      case "leave-management":       return this.prisma.leave.findMany({ where: { employee: { companyId } }, include: { employee: { include: { user: { select: { firstName: true, lastName: true } } } } } });
      case "payroll":                return this.prisma.payroll.findMany({ where: { employee: { companyId } }, include: { employee: { include: { user: { select: { firstName: true, lastName: true } } } } } });
      case "performance-management": return this.prisma.performanceReview.findMany({ where: { companyId }, include: { employee: { include: { user: { select: { firstName: true, lastName: true } } } } } });
      case "learning-training-lms":  return this.prisma.trainingCourse.findMany({ where: { companyId } });
      case "benefits":               return this.prisma.employeeBenefit.findMany({ where: { companyId }, include: { employee: { include: { user: { select: { firstName: true, lastName: true } } } } } });
      case "employee-self-service":  return this.prisma.hrHelpRequest.findMany({ where: { companyId } });
      case "organizational-chart":   return this.prisma.employee.findMany({ where: { companyId }, include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } }, manager: { include: { user: { select: { firstName: true, lastName: true } } } } } });
      case "time-tracking":          return this.prisma.timeSheet.findMany({ where: { companyId }, include: { employee: { include: { user: { select: { firstName: true, lastName: true } } } } } });
      case "shift-scheduling":       return this.prisma.shiftSchedule.findMany({ where: { companyId }, include: { employee: { include: { user: { select: { firstName: true, lastName: true } } } } } });
      case "exit-management":        return this.prisma.exitInterview.findMany({ where: { companyId }, include: { employee: { include: { user: { select: { firstName: true, lastName: true } } } } } });
      case "hr-analytics":           return this.prisma.hrAnalyticsMetric.findMany({ where: { companyId } });
      default:
        throw new NotFoundException(`Unknown HR module: ${moduleSlug}`);
    }
  }

  async createHrModuleData(moduleSlug: string, companyId: string, data: any) {
    switch (moduleSlug) {
      case "recruitment-ats":        return this.prisma.recruitmentCandidate.create({ data: { ...data, companyId } });
      case "onboarding":             return this.prisma.onboardingTask.create({ data: { ...data, companyId } });
      case "performance-management": return this.prisma.performanceReview.create({ data: { ...data, companyId } });
      case "learning-training-lms":  return this.prisma.trainingCourse.create({ data: { ...data, companyId } });
      case "benefits":               return this.prisma.employeeBenefit.create({ data: { ...data, companyId } });
      case "employee-self-service":  return this.prisma.hrHelpRequest.create({ data: { ...data, companyId } });
      case "time-tracking":          return this.prisma.timeSheet.create({ data: { ...data, companyId } });
      case "shift-scheduling":       return this.prisma.shiftSchedule.create({ data: { ...data, companyId } });
      case "exit-management":        return this.prisma.exitInterview.create({ data: { ...data, companyId } });
      case "hr-analytics":           return this.prisma.hrAnalyticsMetric.create({ data: { ...data, companyId } });
      default:
        return { message: `Creation not generically supported for ${moduleSlug}` };
    }
  }
}

