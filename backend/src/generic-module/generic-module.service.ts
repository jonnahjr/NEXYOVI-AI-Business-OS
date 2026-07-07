import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * GenericModuleService – a universal data hub for all 17 pillar modules.
 */
@Injectable()
export class GenericModuleService {
  private readonly PAYROLL_SETTINGS_DEFAULTS = {
    includeAttendanceOvertime: true,
    includeAbsenceDeductions: true,
    includeLatePenalties: true,
    includeUnpaidLeaveDeductions: true,
    includeBonuses: true,
    autoCalculateTax: true,
    includePension: true,
    useWorkDayBasedPay: false,
  };

  constructor(private prisma: PrismaService) {}

  private getModelDelegate(pillarSlug: string, moduleSlug: string) {
    const key = `${pillarSlug}::${moduleSlug}`;
    switch (key) {
      // ── CRM & SALES ─────────────────────────────────────────────
      case 'crm-sales::lead-management':
      case 'crm-sales::leads': return this.prisma.lead;
      case 'crm-sales::opportunity-pipeline': return this.prisma.deal;
      case 'crm-sales::customer-management': return this.prisma.customer;
      case 'crm-sales::contact-management': return this.prisma.customer;
      case 'crm-sales::invoicing': return this.prisma.invoice;
      case 'crm-sales::contracts': return this.prisma.contract;

      // ── INVENTORY & WAREHOUSE ────────────────────────────────────
      case 'inventory-warehouse::products': return this.prisma.product;
      case 'inventory-warehouse::warehouses': return this.prisma.warehouse;
      case 'inventory-warehouse::purchase-orders': return this.prisma.purchase;

      // ── FINANCE & ACCOUNTING ─────────────────────────────────────
      case 'finance-accounting::expenses': return this.prisma.expense;
      case 'finance-accounting::invoicing': return this.prisma.invoice;
      case 'finance-accounting::budgeting': return this.prisma.budget;
      case 'finance-accounting::fixed-assets': return this.prisma.fixedAsset;

      // ── PROCUREMENT ──────────────────────────────────────────────
      case 'procurement::vendor-management': return this.prisma.vendor;
      case 'procurement::purchase-requests': return this.prisma.purchase;
      case 'procurement::contract-management': return this.prisma.contract;

      // ── PROJECT MANAGEMENT ───────────────────────────────────────
      case 'project-management::projects': return this.prisma.project;

      // ── DOCUMENT MANAGEMENT ──────────────────────────────────────
      case 'document-management::documents': return this.prisma.document;

      // ── MARKETING ────────────────────────────────────────────────
      case 'marketing::campaigns': return this.prisma.marketingCampaign;

      // ── LOGISTICS & FLEET ────────────────────────────────────────
      case 'logistics-fleet::vehicles': return this.prisma.vehicle;
      case 'logistics-fleet::drivers': return this.prisma.driver;

      // ── HUMAN RESOURCES ──────────────────────────────────────────
      case 'human-resources::employee-management': return this.prisma.employee;
      case 'human-resources::recruitment-ats': return this.prisma.recruitmentCandidate;
      case 'human-resources::job-posting': return this.prisma.jobPosting;
      case 'human-resources::onboarding': return this.prisma.onboardingTask;
      case 'human-resources::attendance': return this.prisma.attendance;
      case 'human-resources::leave-management': return this.prisma.leave;
      case 'human-resources::payroll': return this.prisma.payroll;
      case 'human-resources::performance-management': return this.prisma.performanceReview;
      case 'human-resources::learning-training-lms': return this.prisma.trainingCourse;
      case 'human-resources::benefits': return this.prisma.employeeBenefit;
      case 'human-resources::employee-self-service': return this.prisma.hrHelpRequest;
      case 'human-resources::organizational-chart': return this.prisma.employee;
      case 'human-resources::time-tracking': return this.prisma.timeSheet;
      case 'human-resources::shift-scheduling': return this.prisma.shiftSchedule;
      case 'human-resources::exit-management': return this.prisma.exitInterview;
      case 'human-resources::hr-analytics': return this.prisma.hrAnalyticsMetric;

      default:
        return null;
    }
  }

  async getData(pillarSlug: string, moduleSlug: string, companyId: string): Promise<any[]> {
    const delegate = this.getModelDelegate(pillarSlug, moduleSlug) as any;
    if (!delegate) return [];

    // If no companyId from token, fall back to first company in DB
    if (!companyId) {
      const firstCompany = await this.prisma.company.findFirst();
      companyId = firstCompany?.id ?? '';
    }

    try {
      if (delegate === this.prisma.product) {
        return delegate.findMany({ where: { companyId }, select: { id: true, sku: true, name: true, category: true, stock: true, unit: true, sellPrice: true, costPrice: true }, orderBy: { name: 'asc' } });
      }
      if (delegate === this.prisma.customer && moduleSlug === 'contact-management') {
        return delegate.findMany({ where: { companyId }, select: { id: true, name: true, email: true, phone: true, company: true, type: true }, orderBy: { name: 'asc' } });
      }
      if (delegate === this.prisma.deal || delegate === this.prisma.invoice) {
        return delegate.findMany({ where: { companyId }, include: { customer: { select: { name: true } } }, orderBy: { createdAt: 'desc' } });
      }
      if (delegate === this.prisma.expense) {
        return delegate.findMany({ where: { companyId }, orderBy: { date: 'desc' } });
      }
      // ── Models without direct companyId (related through employee) ──
      if (delegate === this.prisma.leave) {
        const leaves = await delegate.findMany({
          where: { employee: { companyId } },
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                annualLeaveBalance: true,
                sickLeaveBalance: true,
                maternityLeave: true,
                paternityLeave: true,
                unpaidLeaveBalance: true,
                compassionateLeave: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
        // Map LeaveType → employee balance field
        const BALANCE_MAP: Record<string, string> = {
          ANNUAL: 'annualLeaveBalance',
          SICK: 'sickLeaveBalance',
          MATERNITY: 'maternityLeave',
          PATERNITY: 'paternityLeave',
          UNPAID: 'unpaidLeaveBalance',
        };
        return leaves.map((l: any) => {
          const emp = l.employee || {};
          const balanceField = BALANCE_MAP[l.type] || '';
          const balance = balanceField ? Number(emp[balanceField] || 0) : 0;
          const days = l.startDate && l.endDate
            ? Math.floor(Math.abs(new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
            : 0;
          const remaining = balanceField ? balance - days : null;
          return {
            ...l,
            employee: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
            employeeId: emp.id || '',
            leaveBalances: {
              annual: Number(emp.annualLeaveBalance || 0),
              sick: Number(emp.sickLeaveBalance || 0),
              maternity: Number(emp.maternityLeave || 0),
              paternity: Number(emp.paternityLeave || 0),
              unpaid: Number(emp.unpaidLeaveBalance || 0),
              compassionate: Number(emp.compassionateLeave || 0),
            },
            days,
            remainingDays: remaining,
          };
        });
      }
      if (delegate === this.prisma.attendance) {
        // Use explicit select to avoid non-existent columns (totalHours, overtimeHours, etc.)
        const records = await delegate.findMany({
          where: { employee: { companyId } },
          select: {
            id: true,
            employeeId: true,
            date: true,
            checkIn: true,
            checkOut: true,
            status: true,
            employee: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { date: 'desc' },
        });
        return records.map((r: any) => ({
          id: r.id,
          employeeId: r.employeeId,
          date: r.date,
          checkIn: r.checkIn,
          checkOut: r.checkOut,
          status: r.status,
          isLate: r.status === 'LATE',
          employee: r.employee ? `${r.employee.firstName} ${r.employee.lastName}`.trim() : '',
        }));
      }
      if (delegate === this.prisma.payroll) {
        const records = await delegate.findMany({
          where: { employee: { companyId } },
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                employeeCode: true,
                jobTitle: true,
                employmentType: true,
                status: true,
                department: { select: { name: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
        const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        const STATUS_MAP: Record<string, string> = {
          DRAFT: 'Draft',
          APPROVED: 'Approved',
          PAID: 'Paid',
          CANCELLED: 'Cancelled',
        };
        const fmtEnum = (v: any) => v ? String(v).replace(/_/g, ' ').replace(/\w\S*/g, (w: string) => w.charAt(0) + w.slice(1).toLowerCase()) : '';
        return records.map((r: any) => {
          const emp = r.employee || {};
          return {
            id: r.id,
            employee: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
            employeeId: emp.id || '',
            employeeCode: emp.employeeCode || '',
            department: emp.department?.name || '',
            position: emp.jobTitle || '',
            employmentType: fmtEnum(emp.employmentType),
            empStatus: fmtEnum(emp.status),
            period: `${MONTH_NAMES[r.month - 1] || r.month} ${r.year}`,
            basic: r.baseSalary,
            allowance: r.allowances,
            deduction: r.deductions,
            tax: r.tax,
            net: r.netSalary,
            status: STATUS_MAP[r.status] || r.status,
            paymentDate: r.paymentDate ? r.paymentDate.toISOString().split('T')[0] : '',
            notes: r.notes || '',
            month: r.month,
            year: r.year,
            baseSalary: r.baseSalary,
            prismaId: r.id,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          };
        });
      }

      if (delegate === this.prisma.employee) {
        const emps = await delegate.findMany({
          where: { companyId },
          include: {
            department: { select: { name: true } },
            educations: true,
            certifications: true,
            children: true,
            empDocuments: true,
            experiences: true,
            skills: true,
          },
          orderBy: { createdAt: 'desc' },
        });
        return emps.map(emp => ({
          ...emp,
          name: `${emp.firstName} ${emp.lastName}`.trim(),
          id: emp.employeeCode,
          prismaId: emp.id, // preserve original UUID for edit/delete operations
          position: emp.jobTitle,
          department: emp.department?.name || '',
          startDate: emp.hireDate ? emp.hireDate.toISOString().split('T')[0] : '',
          dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.toISOString().split('T')[0] : '',
          status: emp.status ? emp.status.replace(/_/g, ' ').replace(/\w\S*/g, w => w.charAt(0) + w.slice(1).toLowerCase()) : '',
          employmentType: emp.employmentType ? emp.employmentType.replace(/_/g, ' ').replace(/\w\S*/g, w => w.charAt(0) + w.slice(1).toLowerCase()) : '',
          gender: emp.gender ? emp.gender.charAt(0) + emp.gender.slice(1).toLowerCase() : '',
          nationality: emp.nationality || '',
          maritalStatus: emp.maritalStatus ? emp.maritalStatus.charAt(0) + emp.maritalStatus.slice(1).toLowerCase() : '',
          salaryType: emp.salaryType ? emp.salaryType.charAt(0) + emp.salaryType.slice(1).toLowerCase() : '',
        }));
      }

      // Default fallback if we know there is a createdAt
      return delegate.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' } });
    } catch (e) {
      // If ordering fails (e.g., no createdAt field), try falling back without it
      try {
        return delegate.findMany({ where: { companyId } });
      } catch (err) {
        return [];
      }
    }
  }

  async getDataById(pillarSlug: string, moduleSlug: string, id: string, companyId: string): Promise<any> {
    const delegate = this.getModelDelegate(pillarSlug, moduleSlug) as any;
    if (!delegate) return null;
    if (!companyId) {
      const firstCompany = await this.prisma.company.findFirst();
      companyId = firstCompany?.id ?? '';
    }
    // For employee, return full record with balances
    if (pillarSlug === 'human-resources' && moduleSlug === 'employee-management') {
      const emp = await this.prisma.employee.findFirst({
        where: { id, companyId },
        include: { department: { select: { name: true } } },
      });
      if (!emp) return null;
      return {
        ...emp,
        name: `${emp.firstName} ${emp.lastName}`.trim(),
        annualLeaveBalance: Number(emp.annualLeaveBalance || 0),
        sickLeaveBalance: Number(emp.sickLeaveBalance || 0),
        maternityLeave: Number(emp.maternityLeave || 0),
        paternityLeave: Number(emp.paternityLeave || 0),
        unpaidLeaveBalance: Number(emp.unpaidLeaveBalance || 0),
        compassionateLeave: Number(emp.compassionateLeave || 0),
      };
    }
    // Generic fallback
    try {
      return delegate.findUnique({ where: { id } });
    } catch {
      return null;
    }
  }

  async searchEmployees(companyId: string, query: string): Promise<any[]> {
    if (!companyId) {
      const firstCompany = await this.prisma.company.findFirst();
      companyId = firstCompany?.id ?? '';
    }
    const employees = await this.prisma.employee.findMany({
      where: {
        companyId,
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { employeeCode: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        department: { select: { name: true } },
      },
      orderBy: { firstName: 'asc' },
      take: 15,
    });
    return employees.map(emp => ({
      id: emp.id,
      label: `${emp.firstName} ${emp.lastName}`.trim(),
      employeeCode: emp.employeeCode,
      position: emp.jobTitle,
      department: emp.department?.name || '',
    }));
  }

  async hireCandidate(candidateId: string, companyId: string): Promise<any> {
    // Fallback if no companyId from token
    if (!companyId) {
      const firstCompany = await this.prisma.company.findFirst();
      companyId = firstCompany?.id ?? '';
    }

    const candidate = await this.prisma.recruitmentCandidate.findUnique({
      where: { id: candidateId, companyId }
    });
    if (!candidate) throw new NotFoundException('Candidate not found');

    // Create an employee from the candidate data
    const nameParts = candidate.name.split(' ');
    const firstName = nameParts[0] || candidate.name;
    const lastName = nameParts.slice(1).join(' ') || 'New Employee';

    // Get count for employee code
    const count = await this.prisma.employee.count({ where: { companyId } });
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    const companyAbbr = company?.name?.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 4) || 'NXV';
    const employeeCode = `${companyAbbr}-EMP-${String(count + 1).padStart(4, '0')}`;

    // Create a user for the employee
    const userEmail = candidate.email || `${candidate.name.toLowerCase().replace(/\s+/g, '.')}@nexyovi.com`;
    let user = await this.prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: userEmail,
          password: 'ChangeMe@123',
          firstName,
          lastName,
          role: 'EMPLOYEE',
          companyId,
        }
      });
    }

    // Create the employee record
    const employee = await this.prisma.employee.create({
      data: {
        employeeCode,
        firstName,
        lastName,
        personalEmail: candidate.email,
        personalPhone: candidate.phone,
        jobTitle: candidate.position,
        hireDate: new Date(),
        status: 'ACTIVE',
        companyId,
        userId: user.id,
      }
    });

    // Update candidate stage to HIRED
    await this.prisma.recruitmentCandidate.update({
      where: { id: candidateId },
      data: { stage: 'HIRED' }
    });

    return { employee, candidate: { ...candidate, stage: 'HIRED' } };
  }

  // ── PAYROLL SETTINGS ────────────────────────────────────────────────────
  async getPayrollSettings(companyId: string): Promise<any> {
    if (!companyId) {
      const firstCompany = await this.prisma.company.findFirst();
      companyId = firstCompany?.id ?? '';
    }
    try {
      const settings = await this.prisma.payrollSetting.findUnique({
        where: { companyId },
      });
      if (!settings) {
        // Create default settings — if table doesn't exist, return defaults
        return await this.prisma.payrollSetting.create({
          data: { companyId },
        }).catch(() => ({ ...this.PAYROLL_SETTINGS_DEFAULTS }));
      }
      return settings;
    } catch {
      return { ...this.PAYROLL_SETTINGS_DEFAULTS };
    }
  }

  async upsertPayrollSettings(companyId: string, data: any): Promise<any> {
    if (!companyId) {
      const firstCompany = await this.prisma.company.findFirst();
      companyId = firstCompany?.id ?? '';
    }
    // Only allow updating known boolean fields
    const allowedFields = Object.keys(this.PAYROLL_SETTINGS_DEFAULTS);
    const updateData: Record<string, boolean> = {};
    for (const field of allowedFields) {
      if (typeof data[field] === 'boolean') {
        updateData[field] = data[field];
      }
    }
    try {
      const settings = await this.prisma.payrollSetting.upsert({
        where: { companyId },
        create: { companyId, ...updateData },
        update: updateData,
      });
      return settings;
    } catch {
      // If table doesn't exist, return the intended settings as defaults
      return { companyId, ...this.PAYROLL_SETTINGS_DEFAULTS, ...updateData };
    }
  }

  async generatePayrollForMonth(companyId: string, month: number, year: number): Promise<any> {
    if (!companyId) {
      const firstCompany = await this.prisma.company.findFirst();
      companyId = firstCompany?.id ?? '';
    }

    // ── Load settings (or create defaults) ────────────────────────────────
    const settings = await this.getPayrollSettings(companyId);
    const INCLUDE = {
      overtime:        settings?.includeAttendanceOvertime ?? true,
      absence:         settings?.includeAbsenceDeductions ?? true,
      late:            settings?.includeLatePenalties ?? true,
      unpaidLeave:     settings?.includeUnpaidLeaveDeductions ?? true,
      bonuses:         settings?.includeBonuses ?? true,
      tax:             settings?.autoCalculateTax ?? true,
      pension:         settings?.includePension ?? true,
      workDayBased:    settings?.useWorkDayBasedPay ?? false,
    };

    // Get all active employees with full compensation info
    const employees = await this.prisma.employee.findMany({
      where: { companyId, status: 'ACTIVE' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        salary: true,
        allowances: true,
        bonuses: true,
        pensionContribution: true,
        taxId: true,
      },
    });

    if (employees.length === 0) {
      throw new BadRequestException('No active employees found to generate payroll for.');
    }

    // Check which employees already have payroll for this month
    const existingPayrolls = await this.prisma.payroll.findMany({
      where: { employee: { companyId }, month, year },
      select: { employeeId: true },
    });
    const existingEmployeeIds = new Set(existingPayrolls.map(p => p.employeeId));

    // ── Build month date range ────────────────────────────────────────
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

    // ── Conditionally fetch attendance & leave ──────────────────────────
    let attendances: any[] = [];
    let leaves: any[] = [];

    if (INCLUDE.overtime || INCLUDE.absence || INCLUDE.late || INCLUDE.workDayBased) {
      // Only select columns that actually exist in the database
      // (avoiding totalHours, overtimeHours, isLate, earlyDeparture which
      //  may not have been migrated yet)
      const rawAttendances = await this.prisma.attendance.findMany({
        where: {
          employee: { companyId },
          date: { gte: monthStart, lte: monthEnd },
        },
        select: {
          employeeId: true,
          date: true,
          checkIn: true,
          checkOut: true,
          status: true,
        },
      });
      // Map to include derived fields so downstream code doesn't break
      attendances = rawAttendances.map((a: any) => {
        // Calculate overtime from checkIn/checkOut if available
        let overtimeHours = 0;
        if (a.checkIn && a.checkOut) {
          const workedHrs = (a.checkOut.getTime() - a.checkIn.getTime()) / (1000 * 60 * 60);
          overtimeHours = Math.round(Math.max(0, workedHrs - 8) * 100) / 100; // beyond 8h
        }
        return {
          employeeId: a.employeeId,
          date: a.date,
          status: a.status,
          isLate: a.status === 'LATE',
          overtimeHours,
        };
      });
    }

    if (INCLUDE.unpaidLeave) {
      leaves = await this.prisma.leave.findMany({
        where: {
          employee: { companyId },
          status: 'APPROVED',
          startDate: { lte: monthEnd },
          endDate: { gte: monthStart },
        },
        select: {
          employeeId: true,
          type: true,
          startDate: true,
          endDate: true,
        },
      });
    }

    // ── Group attendance by employee ────────────────────────────────────
    const attendanceByEmp: Record<string, any[]> = {};
    for (const a of attendances) {
      if (!attendanceByEmp[a.employeeId]) attendanceByEmp[a.employeeId] = [];
      attendanceByEmp[a.employeeId].push(a);
    }

    // ── Group leave by employee ─────────────────────────────────────────
    const leaveByEmp: Record<string, any[]> = {};
    for (const l of leaves) {
      if (!leaveByEmp[l.employeeId]) leaveByEmp[l.employeeId] = [];
      leaveByEmp[l.employeeId].push(l);
    }

    const created: any[] = [];
    const skipped: string[] = [];
    const appliedModules: string[] = [];
    if (INCLUDE.workDayBased) appliedModules.push('Work-Day Based Pay');
    if (INCLUDE.overtime) appliedModules.push('Overtime');
    if (INCLUDE.absence) appliedModules.push('Absence');
    if (INCLUDE.late) appliedModules.push('Late Penalty');
    if (INCLUDE.unpaidLeave) appliedModules.push('Unpaid Leave');
    if (INCLUDE.bonuses) appliedModules.push('Bonuses');
    if (INCLUDE.tax) appliedModules.push('Tax');
    if (INCLUDE.pension) appliedModules.push('Pension');

    for (const emp of employees) {
      if (existingEmployeeIds.has(emp.id)) {
        skipped.push(`${emp.firstName} ${emp.lastName}`);
        continue;
      }

      const baseSalary = emp.salary || 0;
      const allowancesAmount = emp.allowances || 0;
      const bonusesAmount = INCLUDE.bonuses ? (emp.bonuses || 0) : 0;
      const dailyRate = baseSalary / 30;
      const hourlyRate = dailyRate / 8;

      // ── Attendance calculations (conditional) ───────────────────────────
      const empAttendance = attendanceByEmp[emp.id] || [];
      let totalOvertimeHours = 0;
      let absentDays = 0;
      let lateDays = 0;
      let halfDays = 0;
      let presentDays = 0;

      for (const att of empAttendance) {
        if (INCLUDE.overtime) totalOvertimeHours += att.overtimeHours || 0;
        if (att.status === 'PRESENT') presentDays++;
        if (INCLUDE.absence && att.status === 'ABSENT') absentDays++;
        if (INCLUDE.late && (att.isLate || att.status === 'LATE')) lateDays++;
        if (INCLUDE.absence && att.status === 'HALF_DAY') halfDays++;
      }

      // ── Leave calculations (conditional, only UNPAID) ────────────────────
      const empLeaves = leaveByEmp[emp.id] || [];
      let unpaidLeaveDays = 0;

      if (INCLUDE.unpaidLeave) {
        for (const lv of empLeaves) {
          if (lv.type !== 'UNPAID') continue;
          const overlapStart = lv.startDate > monthStart ? lv.startDate : monthStart;
          const overlapEnd = lv.endDate < monthEnd ? lv.endDate : monthEnd;
          const days = Math.max(0, Math.floor((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
          unpaidLeaveDays += days;
        }
      }

      // ── Overtime pay ────────────────────────────────────────────────────
      const overtimePay = totalOvertimeHours * hourlyRate * 1.5;

      // ── Late penalty (always applied when attendance is on) ────────────────
      const latePenalty = lateDays * (dailyRate * 0.25);

      // ── Gross income ────────────────────────────────────────────────────
      let grossIncome: number;
      let noteParts: string[] = [];

      if (INCLUDE.workDayBased) {
        // ── WORK-DAY BASED PAY: pay only for days actually worked ─────────
        const daysWorked = presentDays + (halfDays * 0.5);
        const salaryPortion = dailyRate * daysWorked;
        const allowancePortion = (allowancesAmount / 30) * daysWorked;
        grossIncome = Math.max(0, salaryPortion + allowancePortion + bonusesAmount + overtimePay - latePenalty);
        noteParts = [
          `Work days: ${daysWorked.toFixed(1)}d (${presentDays} present + ${halfDays} half)`,
          `Salary: ETB ${Math.round(salaryPortion).toLocaleString()} (${Number(baseSalary).toLocaleString()} ÷ 30 × ${daysWorked.toFixed(1)})`,
        ];
        if (allowancesAmount) noteParts.push(`Allowances prorated: ETB ${Math.round(allowancePortion).toLocaleString()}`);
      } else {
        // ── FULL-MONTH MINUS DEDUCTIONS: standard approach ────────────────
        const absenceDeduction = absentDays * dailyRate;
        const halfDayDeduction = halfDays * (dailyRate * 0.5);
        const unpaidLeaveDeduction = unpaidLeaveDays * dailyRate;
        const totalDeductionsFromTime = absenceDeduction + halfDayDeduction + latePenalty + unpaidLeaveDeduction;
        grossIncome = Math.max(0, baseSalary + allowancesAmount + bonusesAmount + overtimePay - totalDeductionsFromTime);
        noteParts = [`Base: ETB ${baseSalary.toLocaleString()}`];
        if (allowancesAmount) noteParts.push(`Allowances: ETB ${allowancesAmount.toLocaleString()}`);
        if (INCLUDE.absence && absentDays) noteParts.push(`Absent ${absentDays}d: -ETB ${Math.round(absenceDeduction).toLocaleString()}`);
        if (INCLUDE.absence && halfDays) noteParts.push(`Half-day ${halfDays}d: -ETB ${Math.round(halfDayDeduction).toLocaleString()}`);
        if (INCLUDE.unpaidLeave && unpaidLeaveDays) {
          noteParts.push(`Unpaid ${unpaidLeaveDays}d: -ETB ${Math.round(unpaidLeaveDeduction).toLocaleString()}`);
        }
      }

      // ── Tax & Pension (conditional) ─────────────────────────────────────
      let tax = 0;
      let pension = 0;
      let totalDeductions = 0;

      if (INCLUDE.tax) {
        if (grossIncome <= 600) {
          tax = 0;
        } else if (grossIncome <= 1650) {
          tax = (grossIncome - 600) * 0.10;
        } else if (grossIncome <= 3200) {
          tax = 105 + (grossIncome - 1650) * 0.15;
        } else if (grossIncome <= 5250) {
          tax = 337.5 + (grossIncome - 3200) * 0.20;
        } else if (grossIncome <= 7800) {
          tax = 747.5 + (grossIncome - 5250) * 0.25;
        } else if (grossIncome <= 10900) {
          tax = 1385 + (grossIncome - 7800) * 0.30;
        } else {
          tax = 2315 + (grossIncome - 10900) * 0.35;
        }
      }

      if (INCLUDE.pension) {
        pension = emp.pensionContribution ?? baseSalary * 0.07;
      }

      totalDeductions = tax + pension;
      const netSalary = Math.max(0, grossIncome - totalDeductions);

      const roundedTax = Math.round(tax * 100) / 100;
      const roundedDeductions = Math.round(totalDeductions * 100) / 100;
      const roundedNet = Math.round(netSalary * 100) / 100;

      // ── Build shared note parts (common to both modes) ───────────────────
      if (INCLUDE.bonuses && bonusesAmount) noteParts.push(`Bonuses: ETB ${bonusesAmount.toLocaleString()}`);
      if (INCLUDE.overtime && totalOvertimeHours) {
        noteParts.push(`${totalOvertimeHours}h overtime: ETB ${Math.round(overtimePay).toLocaleString()}`);
      }
      if (INCLUDE.late && lateDays) noteParts.push(`Late ${lateDays}d: -ETB ${Math.round(latePenalty).toLocaleString()}`);
      if (INCLUDE.pension) noteParts.push(`Pension: ETB ${Math.round(pension).toLocaleString()}`);
      if (INCLUDE.tax) noteParts.push(`Tax: ETB ${Math.round(tax).toLocaleString()}`);

      const notes = noteParts.join(' | ');

      const payroll = await this.prisma.payroll.create({
        data: {
          employeeId: emp.id,
          month,
          year,
          baseSalary,
          allowances: allowancesAmount,
          deductions: roundedDeductions,
          tax: roundedTax,
          netSalary: roundedNet,
          status: 'DRAFT',
          notes,
        },
      });

      created.push(payroll);
    }

    return {
      month,
      year,
      totalCreated: created.length,
      totalSkipped: skipped.length,
      skippedNames: skipped,
      appliedModules,
      created,
    };
  }

  async createData(pillarSlug: string, moduleSlug: string, companyId: string, data: any): Promise<any> {
    const delegate = this.getModelDelegate(pillarSlug, moduleSlug) as any;
    if (!delegate) return { message: `Record created (mock: ${moduleSlug})`, data };

    // If no companyId from token, fall back to first company in DB
    if (!companyId) {
      const firstCompany = await this.prisma.company.findFirst();
      companyId = firstCompany?.id ?? '';
    }

    if (pillarSlug === 'human-resources' && moduleSlug === 'employee-management') {
      const { educations, certifications, children, empDocuments, experiences, skills, user, ...rawData } = data;

      // ── Strip all non-Prisma-schema fields ────────────────────────
      const EMPLOYEE_FIELDS = new Set([
        'employeeCode','firstName','middleName','lastName','preferredName','dateOfBirth','gender',
        'nationality','ethnicity','religion','maritalStatus','bloodType','profilePhoto',
        'personalEmail','workEmail','personalPhone','workPhone','address','city','region','country','postalCode',
        'nationalId','nationalIdExpiry','passportNumber','passportExpiry',
        'driverLicenseNumber','driverLicenseClass','driverLicenseExpiry',
        'tinNumber','pensionId','workPermit','workPermitExpiry','visaStatus',
        'jobTitle','employmentType','status','hireDate','probationEndDate','confirmationDate',
        'terminationDate','terminationReason','noticePeriodDays','contractType','contractEndDate',
        'workLocation','workShift','branchOffice','gradeLevel','costCenter',
        'salary','salaryType','currency','allowances','bankName','bankAccount','bankBranch',
        'taxId','taxBracket','pensionContribution','paymentMethod','accountHolderName','bonuses',
        'disabilityStatus','medicalConditions','emergencyMedical','vaccinationStatus','medicalInsurance','medicalInsuranceNo',
        'emergencyName','emergencyRelation','emergencyPhone','emergencyEmail',
        'annualLeaveBalance','sickLeaveBalance','maternityLeave','paternityLeave',
        'unpaidLeaveBalance','compassionateLeave','otherLeaveTypes',
        'departmentId','managerId',
      ]);

      const DATE_FIELDS = new Set([
        'dateOfBirth','nationalIdExpiry','passportExpiry','driverLicenseExpiry','workPermitExpiry',
        'hireDate','probationEndDate','confirmationDate','terminationDate','contractEndDate',
      ]);

      const FLOAT_FIELDS = new Set([
        'salary','allowances','pensionContribution','bonuses',
        'annualLeaveBalance','sickLeaveBalance','maternityLeave','paternityLeave',
        'unpaidLeaveBalance','compassionateLeave',
      ]);

      // Enum field normalisation maps
      const GENDER_MAP: Record<string, string> = {
        male: 'MALE', female: 'FEMALE', other: 'OTHER', unspecified: 'UNSPECIFIED',
        m: 'MALE', f: 'FEMALE',
      };
      const MARITAL_MAP: Record<string, string> = {
        single: 'SINGLE', married: 'MARRIED', divorced: 'DIVORCED',
        widowed: 'WIDOWED', separated: 'SEPARATED',
      };
      const EMPLOYMENT_MAP: Record<string, string> = {
        full_time: 'FULL_TIME', 'full time': 'FULL_TIME', fulltime: 'FULL_TIME',
        part_time: 'PART_TIME', 'part time': 'PART_TIME', parttime: 'PART_TIME',
        contract: 'CONTRACT', intern: 'INTERN', freelance: 'FREELANCE',
      };
      const STATUS_MAP: Record<string, string> = {
        active: 'ACTIVE', inactive: 'INACTIVE', on_leave: 'ON_LEAVE',
        terminated: 'TERMINATED', probation: 'PROBATION', suspended: 'SUSPENDED',
      };
      const SALARY_MAP: Record<string, string> = {
        monthly: 'MONTHLY', daily: 'DAILY', hourly: 'HOURLY',
      };

      // Build clean employee object
      const employeeData: Record<string, any> = {};
      for (const [key, val] of Object.entries(rawData)) {
        if (!EMPLOYEE_FIELDS.has(key)) continue;
        if (DATE_FIELDS.has(key)) {
          employeeData[key] = val && val !== '' ? new Date(val as string) : null;
        } else if (FLOAT_FIELDS.has(key)) {
          employeeData[key] = val !== '' && val !== null && val !== undefined ? Number(val) : 0;
        } else {
          employeeData[key] = val === '' ? null : val;
        }
      }

      // Normalise enum fields
      if (employeeData.gender) {
        employeeData.gender = GENDER_MAP[(employeeData.gender as string).toLowerCase()] ?? 'UNSPECIFIED';
      } else {
        employeeData.gender = 'UNSPECIFIED';
      }
      if (employeeData.maritalStatus) {
        employeeData.maritalStatus = MARITAL_MAP[(employeeData.maritalStatus as string).toLowerCase()] ?? 'SINGLE';
      } else {
        employeeData.maritalStatus = 'SINGLE';
      }
      if (employeeData.employmentType) {
        employeeData.employmentType = EMPLOYMENT_MAP[(employeeData.employmentType as string).toLowerCase()] ?? 'FULL_TIME';
      } else {
        employeeData.employmentType = 'FULL_TIME';
      }
      if (employeeData.status) {
        employeeData.status = STATUS_MAP[(employeeData.status as string).toLowerCase()] ?? 'ACTIVE';
      } else {
        employeeData.status = 'ACTIVE';
      }
      if (employeeData.salaryType) {
        employeeData.salaryType = SALARY_MAP[(employeeData.salaryType as string).toLowerCase()] ?? 'MONTHLY';
      } else {
        employeeData.salaryType = 'MONTHLY';
      }

      // Ensure required fields
      if (!employeeData.employeeCode) throw new Error('employeeCode is required');
      if (!employeeData.firstName)    throw new Error('firstName is required');
      if (!employeeData.lastName)     throw new Error('lastName is required');
      if (!employeeData.hireDate)     employeeData.hireDate = new Date();

      // Sanitize relation IDs to ensure they are valid UUIDs
      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
      if (employeeData.departmentId && !uuidRegex.test(employeeData.departmentId)) {
        employeeData.departmentId = null;
      }
      if (employeeData.managerId && !uuidRegex.test(employeeData.managerId)) {
        employeeData.managerId = null;
      }


      // Strip per-item UI-only fields from sub-arrays and map schema differences
      const cleanEducations = (educations || []).map(({ certificateFileName, graduationYear, endDate, ...e }: any) => {
        let finalEndDate: Date | null = null;
        if (endDate) finalEndDate = new Date(endDate);
        else if (graduationYear) finalEndDate = new Date(graduationYear);
        return {
          ...e,
          endDate: finalEndDate,
          gpa: e.gpa ? parseFloat(e.gpa) : null
        };
      });

      const cleanExperiences = (experiences || []).map(({ referenceFileName, referenceUrl, ...e }: any) => ({
        ...e,
        startDate: e.startDate ? new Date(e.startDate) : null,
        endDate: e.endDate ? new Date(e.endDate) : null,
      }));

      const cleanSkills = (skills || []);
      const cleanChildren = (children || []).map((e: any) => ({
        ...e,
        dateOfBirth: e.dateOfBirth ? new Date(e.dateOfBirth) : null,
        gender: GENDER_MAP[(e.gender as string)?.toLowerCase()] ?? 'UNSPECIFIED'
      }));

      const cleanCertifications = (certifications || []);
      const cleanDocs = (empDocuments || []);

      // Auto-create a linked user
      let userId = rawData.userId;
      if (!userId) {
        const email = employeeData.personalEmail || employeeData.workEmail || `${employeeData.employeeCode}@nexyovi.com`;
        // Check if user with this email already exists
        const existingUser = await this.prisma.user.findUnique({ 
          where: { email },
          include: { employee: true }
        });
        
        if (existingUser) {
          if (existingUser.employee) {
            throw new Error(`A user with email ${email} is already linked to an employee record.`);
          }
          userId = existingUser.id;
        } else {
          const newUser = await this.prisma.user.create({
            data: {
              email,
              password: 'ChangeMe@123',
              firstName: employeeData.firstName,
              lastName: employeeData.lastName,
              role: 'EMPLOYEE',
              companyId,
            }
          });
          userId = newUser.id;
        }
      } else {
        // If userId was provided, check if it already has an employee
        const existingEmp = await this.prisma.employee.findUnique({ where: { userId } });
        if (existingEmp) {
          throw new Error(`The provided user ID is already linked to an employee record.`);
        }
      }

      const newEmployee = await delegate.create({
        data: {
          ...employeeData,
          companyId,
          userId,
          educations:      cleanEducations.length      ? { create: cleanEducations }      : undefined,
          certifications:  cleanCertifications.length  ? { create: cleanCertifications }  : undefined,
          children:        cleanChildren.length        ? { create: cleanChildren }        : undefined,
          empDocuments:    cleanDocs.length            ? { create: cleanDocs }            : undefined,
          experiences:     cleanExperiences.length     ? { create: cleanExperiences }     : undefined,
          skills:          cleanSkills.length          ? { create: cleanSkills }          : undefined,
        }
      });

      // ── AUTO-CREATE TODAY'S ATTENDANCE RECORD ──────────────────────
      // Sync the new employee into the attendance system so they appear
      // in the attendance dashboard immediately. Only create for active employees.
      const isActive = employeeData.status === 'ACTIVE' || !employeeData.status;
      if (isActive) {
        try {
          await this.prisma.attendance.create({
            data: {
              employeeId: newEmployee.id,
              date: new Date(),
              status: 'PRESENT',
            },
          });
        } catch (attErr) {
          // Attendance creation is a non-critical side-effect; log and continue
          console.warn('Warning: Could not auto-create attendance record:', String(attErr));
        }
      }

      return newEmployee;
    }

    // ── LEAVE MANAGEMENT: map employee name → employeeId, validate enum values ──
    if (pillarSlug === 'human-resources' && moduleSlug === 'leave-management') {
      const leaveData: Record<string, any> = { ...data };

      // Map employee name to employeeId
      if (leaveData.employee && typeof leaveData.employee === 'string') {
        const searchTerm = leaveData.employee.trim();
        const nameParts = searchTerm.split(/\s+/);

        const where: any[] = [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { employeeCode: { equals: searchTerm, mode: 'insensitive' } },
        ];

        // Also search by first + last name combined (e.g. "Yonas Alemu")
        if (nameParts.length >= 2) {
          where.push({
            firstName: { contains: nameParts[0], mode: 'insensitive' },
            lastName: { contains: nameParts.slice(1).join(' '), mode: 'insensitive' },
          });
        }

        const employee = await this.prisma.employee.findFirst({
          where: { companyId, OR: where },
          orderBy: { createdAt: 'desc' },
        });
        if (employee) {
          leaveData.employeeId = employee.id;
        } else {
          throw new NotFoundException(`Employee "${leaveData.employee}" not found`);
        }
        delete leaveData.employee;
      } else if (leaveData.employeeId) {
        delete leaveData.employee;
      } else {
        throw new BadRequestException('employee or employeeId is required');
      }

      // Validate & normalize date fields
      if (leaveData.startDate) leaveData.startDate = new Date(leaveData.startDate);
      if (leaveData.endDate) leaveData.endDate = new Date(leaveData.endDate);

      // Validate leave type enum
      const VALID_TYPES = ['ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'UNPAID', 'OTHER'];
      if (leaveData.type) {
        const upper = String(leaveData.type).toUpperCase();
        leaveData.type = VALID_TYPES.includes(upper) ? upper : 'OTHER';
      }

      // Validate leave status enum
      const VALID_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
      if (leaveData.status) {
        const upper = String(leaveData.status).toUpperCase();
        leaveData.status = VALID_STATUSES.includes(upper) ? upper : 'PENDING';
      } else {
        leaveData.status = 'PENDING';
      }

      // Strip any non-schema fields
      delete leaveData.days;
      delete leaveData.companyId; // Leave model has no direct companyId — linked through employee

      return delegate.create({ data: leaveData });
    }

    // ── PAYROLL field mapping: frontend keys → Prisma model fields ──
    if (pillarSlug === 'human-resources' && moduleSlug === 'payroll') {
      const payrollData: Record<string, any> = { ...data };

      // Map employee name to employeeId
      if (payrollData.employee && typeof payrollData.employee === 'string') {
        const searchTerm = payrollData.employee.trim();
        const nameParts = searchTerm.split(/\s+/);
        const where: any[] = [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { employeeCode: { equals: searchTerm, mode: 'insensitive' } },
        ];
        if (nameParts.length >= 2) {
          where.push({
            firstName: { contains: nameParts[0], mode: 'insensitive' },
            lastName: { contains: nameParts.slice(1).join(' '), mode: 'insensitive' },
          });
        }
        const employee = await this.prisma.employee.findFirst({
          where: { companyId, OR: where },
          orderBy: { createdAt: 'desc' },
        });
        if (employee) {
          payrollData.employeeId = employee.id;
          // Copy salary info from employee for auto-calculation
          payrollData.baseSalary = payrollData.basic ?? employee.salary ?? 0;
          payrollData.allowances = payrollData.allowance ?? employee.allowances ?? 0;
        } else {
          throw new NotFoundException(`Employee "${payrollData.employee}" not found`);
        }
      } else if (payrollData.employeeId) {
        const employee = await this.prisma.employee.findUnique({ where: { id: payrollData.employeeId } });
        if (employee) {
          payrollData.baseSalary = payrollData.basic ?? employee.salary ?? 0;
          payrollData.allowances = payrollData.allowance ?? employee.allowances ?? 0;
        }
      }

      // Parse period into month/year
      if (payrollData.period) {
        const periodMatch = String(payrollData.period).match(/([A-Za-z]+)\s*(\d{4})/);
        if (periodMatch) {
          const MONTH_MAP: Record<string, number> = {
            january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
            july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
          };
          payrollData.month = MONTH_MAP[periodMatch[1].toLowerCase()] || new Date().getMonth() + 1;
          payrollData.year = parseInt(periodMatch[2]) || new Date().getFullYear();
        }
      } else {
        payrollData.month = payrollData.month || new Date().getMonth() + 1;
        payrollData.year = payrollData.year || new Date().getFullYear();
      }

      // Map frontend fields to Prisma fields
      if (payrollData.basic !== undefined) payrollData.baseSalary = Number(payrollData.basic);
      if (payrollData.allowance !== undefined) payrollData.allowances = Number(payrollData.allowance);
      if (payrollData.deduction !== undefined) payrollData.deductions = Number(payrollData.deduction);
      if (payrollData.net !== undefined) payrollData.netSalary = Number(payrollData.net);

      // Auto-calculate net if not provided
      const gross = (payrollData.baseSalary || 0) + (payrollData.allowances || 0);
      if (payrollData.netSalary === undefined || payrollData.netSalary === null) {
        payrollData.netSalary = Math.max(0, gross - (payrollData.deductions || 0));
      }

      // Validate status enum
      const VALID_PAYROLL_STATUSES = ['DRAFT', 'APPROVED', 'PAID', 'CANCELLED'];
      if (payrollData.status) {
        const upper = String(payrollData.status).toUpperCase();
        payrollData.status = VALID_PAYROLL_STATUSES.includes(upper) ? upper : 'DRAFT';
      } else {
        payrollData.status = 'DRAFT';
      }

      if (payrollData.paymentDate && typeof payrollData.paymentDate === 'string') {
        payrollData.paymentDate = new Date(payrollData.paymentDate);
      }

      // Strip non-schema fields
      delete payrollData.employee;
      delete payrollData.period;
      delete payrollData.basic;
      delete payrollData.allowance;
      delete payrollData.deduction;
      delete payrollData.net;
      delete payrollData.prismaId;
      delete payrollData.remainingDays;
      delete payrollData.leaveBalances;
      delete payrollData.companyId;

      return delegate.create({ data: payrollData });
    }

    return delegate.create({ data: { ...this.convertDateStrings(data), companyId } });
  }

  /**
   * Helper to convert date-only strings (YYYY-MM-DD) to Date objects
   * Used by generic createData and updateData fallbacks.
   */
  private convertDateStrings(data: Record<string, any>): Record<string, any> {
    const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
    const result: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      if (typeof val === 'string' && DATE_PATTERN.test(val)) {
        result[key] = new Date(val + 'T00:00:00.000Z');
      } else {
        result[key] = val;
      }
    }
    return result;
  }

  async updateData(pillarSlug: string, moduleSlug: string, id: string, companyId: string, data: any): Promise<any> {
    const delegate = this.getModelDelegate(pillarSlug, moduleSlug) as any;
    if (!delegate) return { message: `Record updated (mock: ${moduleSlug})`, data };
    
    // Remove the id and companyId so we don't accidentally update them
    delete data.id;
    delete data.companyId;

    if (pillarSlug === 'human-resources' && moduleSlug === 'employee-management') {
      const { educations, certifications, children, empDocuments, experiences, skills, user, ...rawData } = data;
      delete rawData.userId;

      const EMPLOYEE_FIELDS = new Set([
        'employeeCode','firstName','middleName','lastName','preferredName','dateOfBirth','gender',
        'nationality','ethnicity','religion','maritalStatus','bloodType','profilePhoto',
        'personalEmail','workEmail','personalPhone','workPhone','address','city','region','country','postalCode',
        'nationalId','nationalIdExpiry','passportNumber','passportExpiry',
        'driverLicenseNumber','driverLicenseClass','driverLicenseExpiry',
        'tinNumber','pensionId','workPermit','workPermitExpiry','visaStatus',
        'jobTitle','employmentType','status','hireDate','probationEndDate','confirmationDate',
        'terminationDate','terminationReason','noticePeriodDays','contractType','contractEndDate',
        'workLocation','workShift','branchOffice','gradeLevel','costCenter',
        'salary','salaryType','currency','allowances','bankName','bankAccount','bankBranch',
        'taxId','taxBracket','pensionContribution','paymentMethod','accountHolderName','bonuses',
        'disabilityStatus','medicalConditions','emergencyMedical','vaccinationStatus','medicalInsurance','medicalInsuranceNo',
        'emergencyName','emergencyRelation','emergencyPhone','emergencyEmail',
        'annualLeaveBalance','sickLeaveBalance','maternityLeave','paternityLeave',
        'unpaidLeaveBalance','compassionateLeave','otherLeaveTypes',
        'departmentId','managerId',
      ]);
      const DATE_FIELDS = new Set(['dateOfBirth','nationalIdExpiry','passportExpiry','driverLicenseExpiry','workPermitExpiry','hireDate','probationEndDate','confirmationDate','terminationDate','contractEndDate']);
      const FLOAT_FIELDS = new Set(['salary','allowances','pensionContribution','bonuses','annualLeaveBalance','sickLeaveBalance','maternityLeave','paternityLeave','unpaidLeaveBalance','compassionateLeave']);

      // Normalize enum fields (same maps as createData)
      const GENDER_MAP: Record<string, string> = {
        male: 'MALE', female: 'FEMALE', other: 'OTHER', unspecified: 'UNSPECIFIED',
        m: 'MALE', f: 'FEMALE',
      };
      const MARITAL_MAP: Record<string, string> = {
        single: 'SINGLE', married: 'MARRIED', divorced: 'DIVORCED',
        widowed: 'WIDOWED', separated: 'SEPARATED',
      };
      const EMPLOYMENT_MAP: Record<string, string> = {
        full_time: 'FULL_TIME', 'full time': 'FULL_TIME', fulltime: 'FULL_TIME',
        part_time: 'PART_TIME', 'part time': 'PART_TIME', parttime: 'PART_TIME',
        contract: 'CONTRACT', intern: 'INTERN', freelance: 'FREELANCE',
      };
      const STATUS_MAP: Record<string, string> = {
        active: 'ACTIVE', inactive: 'INACTIVE', on_leave: 'ON_LEAVE',
        terminated: 'TERMINATED', probation: 'PROBATION', suspended: 'SUSPENDED',
      };
      const SALARY_MAP: Record<string, string> = {
        monthly: 'MONTHLY', daily: 'DAILY', hourly: 'HOURLY',
      };

      const employeeData: Record<string, any> = {};
      for (const [key, val] of Object.entries(rawData)) {
        if (!EMPLOYEE_FIELDS.has(key)) continue;
        if (DATE_FIELDS.has(key)) {
          employeeData[key] = val && val !== '' ? new Date(val as string) : null;
        } else if (FLOAT_FIELDS.has(key)) {
          employeeData[key] = val !== '' && val !== null && val !== undefined ? Number(val) : 0;
        } else {
          employeeData[key] = val === '' ? null : val;
        }
      }

      // Apply enum normalization
      if (employeeData.gender) {
        employeeData.gender = GENDER_MAP[(employeeData.gender as string).toLowerCase()] ?? 'UNSPECIFIED';
      }
      if (employeeData.maritalStatus) {
        employeeData.maritalStatus = MARITAL_MAP[(employeeData.maritalStatus as string).toLowerCase()] ?? 'SINGLE';
      }
      if (employeeData.employmentType) {
        employeeData.employmentType = EMPLOYMENT_MAP[(employeeData.employmentType as string).toLowerCase()] ?? 'FULL_TIME';
      }
      if (employeeData.status) {
        employeeData.status = STATUS_MAP[(employeeData.status as string).toLowerCase()] ?? 'ACTIVE';
      }
      if (employeeData.salaryType) {
        employeeData.salaryType = SALARY_MAP[(employeeData.salaryType as string).toLowerCase()] ?? 'MONTHLY';
      }

      const cleanEducations = (educations || []).map(({ certificateFileName, ...e }: any) => e);
      const cleanExperiences = (experiences || []).map(({ referenceFileName, ...e }: any) => e);

      return delegate.update({
        where: { id, companyId },
        data: {
          ...employeeData,
          ...(educations    && { educations:     { deleteMany: {}, create: cleanEducations } }),
          ...(certifications && { certifications: { deleteMany: {}, create: certifications } }),
          ...(children      && { children:        { deleteMany: {}, create: children } }),
          ...(empDocuments  && { empDocuments:    { deleteMany: {}, create: empDocuments } }),
          ...(experiences   && { experiences:     { deleteMany: {}, create: cleanExperiences } }),
          ...(skills        && { skills:          { deleteMany: {}, create: skills } }),
        },
      });
    }

    // ── LEAVE MANAGEMENT UPDATE: map employee name → employeeId, validate fields ──
    if (pillarSlug === 'human-resources' && moduleSlug === 'leave-management') {
      delete data.id;
      // Map employee name to employeeId
      if (data.employee && typeof data.employee === 'string') {
        const searchTerm = data.employee.trim();
        const nameParts = searchTerm.split(/\s+/);
        const where: any[] = [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { employeeCode: { equals: searchTerm, mode: 'insensitive' } },
        ];
        if (nameParts.length >= 2) {
          where.push({
            firstName: { contains: nameParts[0], mode: 'insensitive' },
            lastName: { contains: nameParts.slice(1).join(' '), mode: 'insensitive' },
          });
        }
        const employee = await this.prisma.employee.findFirst({
          where: { companyId, OR: where },
          orderBy: { createdAt: 'desc' },
        });
        if (employee) {
          data.employeeId = employee.id;
        } else {
          throw new NotFoundException(`Employee "${data.employee}" not found`);
        }
        delete data.employee;
      } else if (data.employeeId) {
        delete data.employee;
      }
      // Validate & normalize date fields
      if (data.startDate) data.startDate = new Date(data.startDate);
      if (data.endDate) data.endDate = new Date(data.endDate);
      // Validate leave type enum
      const VALID_TYPES = ['ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'UNPAID', 'OTHER'];
      if (data.type) {
        const upper = String(data.type).toUpperCase();
        data.type = VALID_TYPES.includes(upper) ? upper : 'OTHER';
      }
      // Validate leave status enum
      const VALID_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
      if (data.status) {
        const upper = String(data.status).toUpperCase();
        data.status = VALID_STATUSES.includes(upper) ? upper : 'PENDING';
      }
      // Strip any non-schema fields
      delete data.days;
    }

    // ── PAYROLL UPDATE: map frontend keys → Prisma model fields ──
    if (pillarSlug === 'human-resources' && moduleSlug === 'payroll') {
      const payrollData: Record<string, any> = { ...data };

      delete payrollData.id;
      delete payrollData.employee; // employee is display-only, don't try to save

      // Map frontend fields to Prisma fields
      if (payrollData.basic !== undefined) { payrollData.baseSalary = Number(payrollData.basic); delete payrollData.basic; }
      if (payrollData.allowance !== undefined) { payrollData.allowances = Number(payrollData.allowance); delete payrollData.allowance; }
      if (payrollData.deduction !== undefined) { payrollData.deductions = Number(payrollData.deduction); delete payrollData.deduction; }
      if (payrollData.net !== undefined) { payrollData.netSalary = Number(payrollData.net); delete payrollData.net; }

      // Remove other frontend-only fields
      delete payrollData.period;
      delete payrollData.prismaId;
      delete payrollData.remainingDays;
      delete payrollData.leaveBalances;

      // Validate status
      if (payrollData.status) {
        const upper = String(payrollData.status).toUpperCase();
        const VALID = ['DRAFT', 'APPROVED', 'PAID', 'CANCELLED'];
        payrollData.status = VALID.includes(upper) ? upper : 'DRAFT';
      }

      if (payrollData.paymentDate && typeof payrollData.paymentDate === 'string') {
        payrollData.paymentDate = new Date(payrollData.paymentDate);
      }

      // Payroll doesn't have a direct companyId field — linked through employee
      try {
        return await delegate.update({ where: { id }, data: payrollData });
      } catch {
        return delegate.update({ where: { id, companyId }, data: payrollData });
      }
    }

    // Convert date strings to Date objects before updating
    const dateConverted = this.convertDateStrings(data);
    try {
      return await delegate.update({ where: { id, companyId }, data: dateConverted });
    } catch {
      // Some models (Leave, Attendance, Payroll) don't have a direct companyId field
      return delegate.update({ where: { id }, data: dateConverted });
    }
  }

  async deleteData(pillarSlug: string, moduleSlug: string, id: string, companyId: string): Promise<any> {
    const delegate = this.getModelDelegate(pillarSlug, moduleSlug) as any;
    if (!delegate) return { message: `Record deleted (mock: ${moduleSlug})` };
    try {
      return await delegate.delete({ where: { id, companyId } });
    } catch {
      // Some models (Leave, Attendance, Payroll) don't have a direct companyId field
      return await delegate.delete({ where: { id } });
    }
  }
}
