import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  // ─── CHECK-IN (raw SQL to bypass Prisma ORM column issues) ────────
  async checkIn(employeeId: string, companyId: string, data: {
    latitude?: number;
    longitude?: number;
    locationName?: string;
    ipAddress?: string;
    deviceType?: string;
    deviceSerial?: string;
    biometricVerified?: boolean;
    biometricTemplateId?: string;
    biometricDeviceId?: string;
    checkInPhotoUrl?: string;
    notes?: string;
  }) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');
    if (employee.companyId !== companyId) throw new BadRequestException('Employee not in your company');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if already checked in today (raw SQL to avoid schema issues)
    const existing: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT "id", "checkIn", "checkOut" FROM "Attendance" WHERE "employeeId" = $1 AND "date" >= $2 AND "date" < $3 LIMIT 1`,
      employeeId, today, tomorrow
    );
    if (existing[0]?.checkIn && !existing[0]?.checkOut) {
      throw new BadRequestException('Already checked in today. Use check-out endpoint.');
    }

    const now = new Date();

    // Check scheduled shift for late detection (with guard)
    let status = 'PRESENT';
    try {
      const schedule: any[] = await this.prisma.$queryRawUnsafe(
        `SELECT "startTime" FROM "ShiftSchedule" WHERE "employeeId" = $1 AND "status" = 'SCHEDULED' AND "startTime" >= $2 AND "startTime" < $3 ORDER BY "startTime" DESC LIMIT 1`,
        employeeId, today, tomorrow
      );
      if (schedule[0]) {
        const lateThreshold = new Date(schedule[0].startTime.getTime() + 15 * 60000);
        if (now > lateThreshold) status = 'LATE';
      }
    } catch { /* shiftSchedule table may not exist */ }

    // Raw INSERT — only columns known to exist in the DB
    // NOTE: $5 (status) must NOT be cast to ::text because PostgreSQL
    // cannot implicitly convert text to the AttendanceStatus enum type.
    const result: any[] = await this.prisma.$queryRawUnsafe(
      `INSERT INTO "Attendance" ("id", "employeeId", "date", "checkIn", "status")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING "id", "employeeId", "date", "checkIn", "status"`,
      crypto.randomUUID(), employeeId, today, now, status
    );

    const rec = result[0];
    return { ...rec, employee: { firstName: employee.firstName, lastName: employee.lastName } };
  }

  // ─── CHECK-OUT (raw SQL to bypass Prisma ORM column issues) ───────
  async checkOut(employeeId: string, companyId: string, data: {
    latitude?: number;
    longitude?: number;
    locationName?: string;
    ipAddress?: string;
    deviceType?: string;
    checkOutPhotoUrl?: string;
    notes?: string;
  }) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');
    if (employee.companyId !== companyId) throw new BadRequestException('Employee not in your company');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Raw SELECT to avoid schema issues
    const existing: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT "id", "checkIn", "checkOut" FROM "Attendance" WHERE "employeeId" = $1 AND "date" >= $2 AND "date" < $3 LIMIT 1`,
      employeeId, today, tomorrow
    );
    if (!existing[0]) throw new NotFoundException('No check-in found for today');
    if (existing[0].checkOut) throw new BadRequestException('Already checked out today');

    const now = new Date();

    // Raw UPDATE — only columns known to exist
    await this.prisma.$executeRawUnsafe(
      `UPDATE "Attendance" SET "checkOut" = $1 WHERE "id" = $2`,
      now, existing[0].id
    );

    const result: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT "id", "employeeId", "date", "checkIn", "checkOut", "status" FROM "Attendance" WHERE "id" = $1`,
      existing[0].id
    );

    return { ...result[0], employee: { firstName: employee.firstName, lastName: employee.lastName } };
  }

  // ─── GET TODAY'S ATTENDANCE ──────────────────────────────────────
  async getTodayAttendance(companyId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Only select columns that actually exist in the database
    // (avoiding totalHours, overtimeHours, isLate, earlyDeparture, deviceType, etc.
    //  that may not have been migrated yet)
    const records = await this.prisma.attendance.findMany({
      where: { employee: { companyId }, date: { gte: today, lt: tomorrow } },
      select: {
        id: true,
        date: true,
        checkIn: true,
        checkOut: true,
        status: true,
        employeeId: true,
      },
      orderBy: { checkIn: 'desc' },
    });

    // Fetch employee details separately to avoid relation-schema issues
    const empIds = [...new Set(records.map(r => r.employeeId))];
    const employees = await this.prisma.employee.findMany({
      where: { id: { in: empIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        employeeCode: true,
        department: { select: { name: true } },
        user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
      },
    });
    const empMap = Object.fromEntries(employees.map(e => [e.id, e]));

    return records.map(r => ({
      ...r,
      isLate: r.status === 'LATE',
      totalHours: r.checkIn && r.checkOut ? Math.round((r.checkOut.getTime() - r.checkIn.getTime()) / 3600000 * 100) / 100 : null,
      overtimeHours: r.checkIn && r.checkOut ? Math.round(Math.max(0, (r.checkOut.getTime() - r.checkIn.getTime()) / 3600000 - 8) * 100) / 100 : null,
      employee: empMap[r.employeeId] || { id: r.employeeId, firstName: '', lastName: '' },
    }));
  }

  // ─── GET ATTENDANCE BY DATE RANGE ────────────────────────────────
  async getAttendanceByDateRange(companyId: string, startDate: string, endDate: string, employeeId?: string) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const where: any = { employee: { companyId }, date: { gte: start, lte: end } };
    if (employeeId) where.employeeId = employeeId;

    const records = await this.prisma.attendance.findMany({
      where,
      select: {
        id: true,
        date: true,
        checkIn: true,
        checkOut: true,
        status: true,
        employeeId: true,
      },
      orderBy: [{ date: 'desc' }, { checkIn: 'desc' }],
    });

    // Fetch employee details separately
    const empIds = [...new Set(records.map(r => r.employeeId))];
    const employees = await this.prisma.employee.findMany({
      where: { id: { in: empIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        employeeCode: true,
        department: { select: { name: true } },
        user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
      },
    });
    const empMap = Object.fromEntries(employees.map(e => [e.id, e]));

    return records.map(r => ({
      ...r,
      isLate: r.status === 'LATE',
      totalHours: r.checkIn && r.checkOut ? Math.round((r.checkOut.getTime() - r.checkIn.getTime()) / 3600000 * 100) / 100 : null,
      overtimeHours: r.checkIn && r.checkOut ? Math.round(Math.max(0, (r.checkOut.getTime() - r.checkIn.getTime()) / 3600000 - 8) * 100) / 100 : null,
      employee: empMap[r.employeeId] || { id: r.employeeId, firstName: '', lastName: '' },
    }));
  }

  // ─── BULK MARK ATTENDANCE ────────────────────────────────────────
  async bulkMarkAttendance(companyId: string, records: {
    employeeId: string;
    date: string;
    status: string;
    checkIn?: string;
    checkOut?: string;
    notes?: string;
  }[]) {
    const results: any[] = [];
    for (const record of records) {
      try {
        const recordDate = new Date(record.date);
        const nextDay = new Date(recordDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const existing = await this.prisma.attendance.findFirst({
          select: { id: true },
          where: { employeeId: record.employeeId, date: { gte: recordDate, lt: nextDay } },
        });
        
        let attendance;
        const safeData: Record<string, any> = {
          checkIn: record.checkIn ? new Date(record.checkIn) : undefined,
          checkOut: record.checkOut ? new Date(record.checkOut) : undefined,
          status: record.status as any,
        };
        if (existing) {
          attendance = await this.prisma.attendance.update({
            where: { id: existing.id },
            data: safeData,
          });
        } else {
          attendance = await this.prisma.attendance.create({
            data: {
              employeeId: record.employeeId,
              date: recordDate,
              ...safeData,
            },
          });
        }
        results.push({ success: true, data: attendance });
      } catch (err: any) {
        results.push({ success: false, employeeId: record.employeeId, error: err.message });
      }
    }
    return results;
  }

  async bulkMarkByStatus(companyId: string, date: string, employeeIds: string[], status: string) {
    const resultDate = new Date(date);
    const results: any[] = [];
    for (const employeeId of employeeIds) {
      try {
        const existing = await this.prisma.attendance.findFirst({
          select: { id: true },
          where: { employeeId, date: { gte: new Date(date), lt: new Date(new Date(date).getTime() + 86400000) } },
        });
        if (existing) {
          const updated = await this.prisma.attendance.update({
            where: { id: existing.id },
            data: { status: status as any },
          });
          results.push({ success: true, data: updated, action: 'updated' });
        } else {
          const created = await this.prisma.attendance.create({
            data: { employeeId, date: resultDate, status: status as any },
          });
          results.push({ success: true, data: created, action: 'created' });
        }
      } catch (err: any) {
        results.push({ success: false, employeeId, error: err.message });
      }
    }
    return results;
  }

  // ─── ATTENDANCE SUMMARY ──────────────────────────────────────────
  async getAttendanceSummary(companyId: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    // Only select columns that exist in the database
    const [totalEmployees, todayRecords, monthlyRecords, pendingAbsences] = await Promise.all([
      this.prisma.employee.count({ where: { companyId, status: 'ACTIVE' } }),
      this.prisma.attendance.findMany({
        where: { employee: { companyId }, date: { gte: targetDate, lt: nextDay } },
        select: { status: true, checkIn: true, checkOut: true },
      }),
      this.prisma.attendance.findMany({
        where: { employee: { companyId }, date: { gte: monthStart, lte: monthEnd } },
        select: { status: true, checkIn: true, checkOut: true },
      }),
      this.prisma.leave.count({
        where: { employee: { companyId }, status: 'PENDING' },
      }),
    ]);

    const todayStats = {
      present: todayRecords.filter(r => r.status === 'PRESENT').length,
      late: todayRecords.filter(r => r.status === 'LATE').length,
      absent: todayRecords.filter(r => r.status === 'ABSENT').length,
      halfDay: todayRecords.filter(r => r.status === 'HALF_DAY').length,
      onLeave: todayRecords.filter(r => r.status === 'ON_LEAVE').length,
      remote: todayRecords.filter(r => r.status === 'REMOTE').length,
      notMarked: totalEmployees - todayRecords.length,
      checkedIn: todayRecords.filter(r => r.checkIn && !r.checkOut).length,
      checkedOut: todayRecords.filter(r => r.checkIn && r.checkOut).length,
      biometricVerified: 0, // column may not exist in DB
      totalHours: todayRecords.reduce((sum, r) => {
        if (r.checkIn && r.checkOut) return sum + (r.checkOut.getTime() - r.checkIn.getTime()) / 3600000;
        return sum;
      }, 0),
      overtimeHours: 0, // column may not exist in DB
      deviceBreakdown: { 'MANUAL': todayRecords.length }, // placeholder
    };

    const monthlyHours = monthlyRecords.reduce((sum, r) => {
      if (r.checkIn && r.checkOut) return sum + (r.checkOut.getTime() - r.checkIn.getTime()) / 3600000;
      return sum;
    }, 0);
    const monthlyOvertime = 0; // column may not exist

    return {
      date: targetDate.toISOString().split('T')[0],
      totalEmployees,
      today: todayStats,
      monthly: {
        totalRecords: monthlyRecords.length,
        totalHours: Math.round(monthlyHours * 100) / 100,
        overtimeHours: Math.round(monthlyOvertime * 100) / 100,
      },
      pendingAbsences,
      attendanceRate: totalEmployees > 0
        ? Math.round(((todayStats.present + todayStats.late) / totalEmployees) * 100)
        : 0,
    };
  }

  private getDeviceBreakdown(records: any[]) {
    const breakdown: Record<string, number> = {};
    for (const r of records) {
      const type = r.deviceType || 'UNKNOWN';
      breakdown[type] = (breakdown[type] || 0) + 1;
    }
    return breakdown;
  }

  // ─── EMPLOYEE MONTHLY REPORT ─────────────────────────────────────
  async getEmployeeMonthlyReport(employeeId: string, companyId: string, month: number, year: number) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee || employee.companyId !== companyId) throw new NotFoundException('Employee not found');

    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

    const records = await this.prisma.attendance.findMany({
      where: { employeeId, date: { gte: monthStart, lte: monthEnd } },
      select: { id: true, date: true, checkIn: true, checkOut: true, status: true },
      orderBy: { date: 'asc' },
    });

    const totalDays = records.length;
    const presents = records.filter(r => r.status === 'PRESENT').length;
    const lates = records.filter(r => r.status === 'LATE').length;
    const absents = records.filter(r => r.status === 'ABSENT').length;

    const totalHours = records.reduce((sum, r) => {
      if (r.checkIn && r.checkOut) return sum + (r.checkOut.getTime() - r.checkIn.getTime()) / 3600000;
      return sum;
    }, 0);

    return {
      employeeId,
      month,
      year,
      totalDays,
      presents,
      lates,
      absents,
      totalHours: Math.round(totalHours * 100) / 100,
      overtimeHours: 0, // column may not exist in DB
      records: records.map(r => ({ ...r, isLate: r.status === 'LATE' })),
    };
  }

  // ─── BIOMETRIC DEVICE CRUD ────────────────────────────────────────
  async getDevices(companyId: string) {
    // Guard against missing tables (schema not fully migrated)
    try {
      return await this.prisma.biometricDevice.findMany({
        where: { companyId },
        orderBy: { name: 'asc' },
      });
    } catch {
      return [];
    }
  }

  async createDevice(companyId: string, data: {
    name: string;
    deviceType: string;
    serialNumber: string;
    model?: string;
    ipAddress?: string;
    port?: number;
    location?: string;
  }) {
    try {
      return await this.prisma.biometricDevice.create({ data: { ...data, companyId } });
    } catch {
      throw new BadRequestException('Device table unavailable (schema not migrated)');
    }
  }

  async updateDevice(id: string, companyId: string, data: any) {
    try {
      const device = await this.prisma.biometricDevice.findFirst({ where: { id, companyId } });
      if (!device) throw new NotFoundException('Device not found');
      return this.prisma.biometricDevice.update({ where: { id }, data });
    } catch {
      throw new NotFoundException('Device not found or table unavailable');
    }
  }

  async deleteDevice(id: string, companyId: string) {
    try {
      const device = await this.prisma.biometricDevice.findFirst({ where: { id, companyId } });
      if (!device) throw new NotFoundException('Device not found');
      return this.prisma.biometricDevice.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Device not found or table unavailable');
    }
  }

  // ─── BIOMETRIC SYNC ──────────────────────────────────────────────
  async syncDevice(deviceId: string, companyId: string, records: {
    employeeId: string;
    date: string;
    checkIn?: string;
    checkOut?: string;
    biometricVerified: boolean;
    biometricTemplateId: string;
  }[]) {
    let device: any;
    try {
      device = await this.prisma.biometricDevice.findFirst({ where: { id: deviceId, companyId } });
      if (!device) throw new NotFoundException('Device not found');
    } catch {
      throw new NotFoundException('Device table unavailable (schema not migrated)');
    }

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const record of records) {
      try {
        const recordDate = new Date(record.date);
        const nextDay = new Date(recordDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const existing = await this.prisma.attendance.findFirst({
          where: { employeeId: record.employeeId, date: { gte: recordDate, lt: nextDay } },
        });

        // Only use columns that exist in the DB
        const safeData: Record<string, any> = {
          checkIn: record.checkIn ? new Date(record.checkIn) : undefined,
          checkOut: record.checkOut ? new Date(record.checkOut) : undefined,
        };

        if (existing) {
          await this.prisma.attendance.update({
            where: { id: existing.id },
            data: safeData,
          });
        } else {
          await this.prisma.attendance.create({
            data: {
              employeeId: record.employeeId,
              date: recordDate,
              ...safeData,
            },
          });
        }
        successCount++;
      } catch (err) {
        failCount++;
        errors.push(`Employee ${record.employeeId}: ${err.message}`);
      }
    }

    const syncStatus = failCount === 0 ? 'SUCCESS' : successCount > 0 ? 'PARTIAL' : 'FAILED';

    // Create sync log (with fallback if table doesn't exist)
    try {
      await this.prisma.biometricSyncLog.create({
        data: {
          deviceId,
          companyId,
          syncType: 'PULL',
          recordsSynced: records.length,
          status: syncStatus,
          errorMessage: errors.length > 0 ? errors.join('; ') : null,
        },
      });
    } catch { /* log table may not exist */ }

    // Update device last sync (with fallback if table doesn't exist)
    try {
      await this.prisma.biometricDevice.update({
        where: { id: deviceId },
        data: { lastSyncAt: new Date(), lastSyncStatus: syncStatus },
      });
    } catch { /* device table may not exist */ }

    return { success: successCount, failed: failCount, status: syncStatus, errors };
  }

  async getDeviceSyncLogs(deviceId: string, companyId: string) {
    try {
      return await this.prisma.biometricSyncLog.findMany({
        where: { deviceId, companyId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    } catch {
      return [];
    }
  }

  // ─── GET ALL EMPLOYEES FOR ATTENDANCE ────────────────────────────
  async getEligibleEmployees(companyId: string) {
    const employees = await this.prisma.employee.findMany({
      where: { companyId, status: 'ACTIVE' },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        department: { select: { name: true } },
        user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
      },
      orderBy: { firstName: 'asc' },
    });

    // Fetch latest attendance separately to avoid relation schema issues
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const empIds = employees.map(e => e.id);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayAttendances = await this.prisma.attendance.findMany({
      where: { employeeId: { in: empIds }, date: { gte: today, lt: tomorrow } },
      select: { employeeId: true, status: true, date: true, checkIn: true },
      orderBy: { date: 'desc' },
    });
    const attMap: Record<string, any> = {};
    for (const a of todayAttendances) {
      if (!attMap[a.employeeId]) attMap[a.employeeId] = a;
    }

    return employees.map(emp => ({
      ...emp,
      attendances: attMap[emp.id] ? [attMap[emp.id]] : [],
    }));
  }

  // ─── SYNC ALL ACTIVE EMPLOYEES TO TODAY'S ATTENDANCE ─────────────
  // Creates a PRESENT attendance record for every active employee who
  // does NOT already have a record for today. This is a bulk "sync"
  // operation that brings all employees into the attendance dashboard.
  async syncAllToAttendance(companyId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all active employees
    const activeEmployees = await this.prisma.employee.findMany({
      where: { companyId, status: 'ACTIVE' },
      select: { id: true, firstName: true, lastName: true },
    });

    // Get IDs of employees who already have today's attendance
    const existingRecords = await this.prisma.attendance.findMany({
      where: {
        employeeId: { in: activeEmployees.map(e => e.id) },
        date: { gte: today, lt: tomorrow },
      },
      select: { employeeId: true },
    });
    const existingIds = new Set(existingRecords.map(r => r.employeeId));

    // Filter to only employees without today's attendance
    const toSync = activeEmployees.filter(e => !existingIds.has(e.id));

    if (toSync.length === 0) {
      return { synced: 0, message: 'All employees already have attendance records for today' };
    }

    // Bulk create attendance records
    const created = await this.prisma.attendance.createMany({
      data: toSync.map(e => ({
        employeeId: e.id,
        date: today,
        status: 'PRESENT' as const,
      })),
    });

    return {
      synced: created.count,
      total: activeEmployees.length,
      alreadyHadRecord: existingIds.size,
      employees: toSync.map(e => `${e.firstName} ${e.lastName}`),
    };
  }
}
