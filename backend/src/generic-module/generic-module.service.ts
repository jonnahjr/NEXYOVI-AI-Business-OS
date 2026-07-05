import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * GenericModuleService – a universal data hub for all 17 pillar modules.
 */
@Injectable()
export class GenericModuleService {
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
      if (delegate === this.prisma.employee) {
        const emps = await delegate.findMany({
          where: { companyId },
          include: { educations: true, certifications: true, children: true, empDocuments: true, experiences: true, skills: true },
          orderBy: { createdAt: 'desc' },
        });
        return emps.map(emp => ({
          ...emp,
          name: `${emp.firstName} ${emp.lastName}`.trim(),
          id: emp.employeeCode,
          position: emp.jobTitle,
          startDate: emp.hireDate ? emp.hireDate.toISOString().split('T')[0] : '',
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

      return delegate.create({
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
    }

    return delegate.create({ data: { ...data, companyId } });
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

    return delegate.update({
      where: { id, companyId },
      data,
    });
  }

  async deleteData(pillarSlug: string, moduleSlug: string, id: string, companyId: string): Promise<any> {
    const delegate = this.getModelDelegate(pillarSlug, moduleSlug) as any;
    if (!delegate) return { message: `Record deleted (mock: ${moduleSlug})` };
    return delegate.delete({
      where: { id, companyId },
    });
  }
}
