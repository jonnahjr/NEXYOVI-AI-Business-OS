import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  // ─── CHECK-IN ─────────────────────────────────────────────────────
  @Post('check-in/:employeeId')
  @ApiOperation({ summary: 'Check-in an employee with optional biometric/geo data' })
  checkIn(
    @Param('employeeId') employeeId: string,
    @Request() req: any,
    @Body() body: {
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
    },
  ) {
    return this.attendanceService.checkIn(employeeId, req.user.companyId, body);
  }

  // ─── CHECK-OUT ────────────────────────────────────────────────────
  @Post('check-out/:employeeId')
  @ApiOperation({ summary: 'Check-out an employee' })
  checkOut(
    @Param('employeeId') employeeId: string,
    @Request() req: any,
    @Body() body: {
      latitude?: number;
      longitude?: number;
      locationName?: string;
      ipAddress?: string;
      deviceType?: string;
      checkOutPhotoUrl?: string;
      notes?: string;
    },
  ) {
    return this.attendanceService.checkOut(employeeId, req.user.companyId, body);
  }

  // ─── TODAY'S ATTENDANCE ──────────────────────────────────────────
  @Get('today')
  @ApiOperation({ summary: 'Get today\'s attendance records' })
  getTodayAttendance(@Request() req: any) {
    return this.attendanceService.getTodayAttendance(req.user.companyId);
  }

  // ─── ATTENDANCE BY DATE RANGE ────────────────────────────────────
  @Get('range')
  @ApiOperation({ summary: 'Get attendance by date range' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'employeeId', required: false })
  getByDateRange(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.attendanceService.getAttendanceByDateRange(req.user.companyId, startDate, endDate, employeeId);
  }

  // ─── SUMMARY ──────────────────────────────────────────────────────
  @Get('summary')
  @ApiOperation({ summary: 'Get attendance summary with stats' })
  @ApiQuery({ name: 'date', required: false })
  getSummary(@Request() req: any, @Query('date') date?: string) {
    return this.attendanceService.getAttendanceSummary(req.user.companyId, date);
  }

  // ─── EMPLOYEE MONTHLY REPORT ─────────────────────────────────────
  @Get('report/:employeeId')
  @ApiOperation({ summary: 'Get monthly attendance report for an employee' })
  @ApiQuery({ name: 'month', required: true })
  @ApiQuery({ name: 'year', required: true })
  getEmployeeReport(
    @Param('employeeId') employeeId: string,
    @Request() req: any,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.attendanceService.getEmployeeMonthlyReport(employeeId, req.user.companyId, +month, +year);
  }

  // ─── BULK MARK ────────────────────────────────────────────────────
  @Post('bulk')
  @ApiOperation({ summary: 'Bulk mark attendance for multiple employees on a date' })
  bulkMark(
    @Request() req: any,
    @Body() body: { date: string; employeeIds: string[]; status: string },
  ) {
    return this.attendanceService.bulkMarkByStatus(req.user.companyId, body.date, body.employeeIds, body.status);
  }

  // ─── ELIGIBLE EMPLOYEES ──────────────────────────────────────────
  @Get('employees')
  @ApiOperation({ summary: 'Get all active employees with their today status' })
  getEligibleEmployees(@Request() req: any) {
    return this.attendanceService.getEligibleEmployees(req.user.companyId);
  }

  // ─── SYNC ALL ────────────────────────────────────────────────────
  @Post('sync-all')
  @ApiOperation({ summary: 'Create attendance records for all active employees who lack today\'s entry' })
  syncAllToAttendance(@Request() req: any) {
    return this.attendanceService.syncAllToAttendance(req.user.companyId);
  }

  // ================================================================
  // BIOMETRIC DEVICE MANAGEMENT
  // ================================================================

  @Get('devices')
  @ApiOperation({ summary: 'List all biometric devices' })
  getDevices(@Request() req: any) {
    return this.attendanceService.getDevices(req.user.companyId);
  }

  @Post('devices')
  @ApiOperation({ summary: 'Register a new biometric device' })
  createDevice(@Request() req: any, @Body() body: {
    name: string;
    deviceType: string;
    serialNumber: string;
    model?: string;
    ipAddress?: string;
    port?: number;
    location?: string;
  }) {
    return this.attendanceService.createDevice(req.user.companyId, body);
  }

  @Put('devices/:id')
  @ApiOperation({ summary: 'Update a biometric device' })
  updateDevice(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.attendanceService.updateDevice(id, req.user.companyId, body);
  }

  @Delete('devices/:id')
  @ApiOperation({ summary: 'Delete a biometric device' })
  deleteDevice(@Param('id') id: string, @Request() req: any) {
    return this.attendanceService.deleteDevice(id, req.user.companyId);
  }

  @Post('devices/:id/sync')
  @ApiOperation({ summary: 'Sync attendance records from a biometric device' })
  syncDevice(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { records: any[] },
  ) {
    return this.attendanceService.syncDevice(id, req.user.companyId, body.records);
  }

  @Get('devices/:id/sync-logs')
  @ApiOperation({ summary: 'Get sync logs for a device' })
  getDeviceSyncLogs(@Param('id') id: string, @Request() req: any) {
    return this.attendanceService.getDeviceSyncLogs(id, req.user.companyId);
  }
}
