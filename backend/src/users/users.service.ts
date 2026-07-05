import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getAll(companyId: string) {
    return this.prisma.user.findMany({
      where: { companyId },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, isActive: true, avatarUrl: true, phone: true,
        createdAt: true, employee: { select: { jobTitle: true, department: { select: { name: true } } } },
      },
      orderBy: { firstName: 'asc' },
    });
  }

  async getOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, isActive: true, avatarUrl: true, phone: true,
        createdAt: true, updatedAt: true,
        employee: { include: { department: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(companyId: string, data: {
    email: string; password: string; firstName: string; lastName: string;
    role?: any; phone?: string; jobTitle?: string; departmentId?: string;
    salary?: number; employeeCode?: string;
  }) {
    const hashed = await bcrypt.hash(data.password, 12);
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'EMPLOYEE',
        phone: data.phone,
        companyId,
        employee: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            employeeCode: data.employeeCode || `EMP-${Date.now()}`,
            jobTitle: data.jobTitle,
            departmentId: data.departmentId,
            salary: data.salary || 0,
            companyId,
          },
        },
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
  }

  async update(id: string, data: any) {
    const { password, ...rest } = data;
    const updateData: any = { ...rest };
    if (password) updateData.password = await bcrypt.hash(password, 12);
    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
    });
  }

  async toggleActive(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({ where: { id }, data: { isActive: !user.isActive } });
  }

  async getProfile(userId: string) {
    return this.getOne(userId);
  }
}
