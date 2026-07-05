import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HrService } from './hr.service';

@ApiTags('HR')
@ApiBearerAuth()
@Controller(['hr', 'human-resources'])
export class HrController {
  constructor(private hrService: HrService) {}

  // ─── STATS ──────────────────────────────────────────────────────
  @Get('stats/:companyId')
  @ApiOperation({ summary: 'Get HR dashboard statistics' })
  getStats(@Param('companyId') companyId: string) {
    return this.hrService.getHrStats(companyId);
  }

  // ─── DEPARTMENTS ───────────────────────────────────────────────
  @Get('departments/:companyId')
  @ApiOperation({ summary: 'Get all departments' })
  getDepartments(@Param('companyId') companyId: string) {
    return this.hrService.getDepartments(companyId);
  }

  @Post('departments/:companyId')
  @ApiOperation({ summary: 'Create department' })
  createDepartment(@Param('companyId') companyId: string, @Body() body: { name: string; description?: string }) {
    return this.hrService.createDepartment(companyId, body);
  }

  @Put('departments/:id')
  @ApiOperation({ summary: 'Update department' })
  updateDepartment(@Param('id') id: string, @Body() body: { name?: string; description?: string }) {
    return this.hrService.updateDepartment(id, body);
  }

  @Delete('departments/:id')
  @ApiOperation({ summary: 'Delete department' })
  deleteDepartment(@Param('id') id: string) {
    return this.hrService.deleteDepartment(id);
  }

  // ─── EMPLOYEES ─────────────────────────────────────────────────
  @Get('employees/:companyId')
  @ApiOperation({ summary: 'Get all employees' })
  getEmployees(@Param('companyId') companyId: string) {
    return this.hrService.getEmployees(companyId);
  }

  @Get('employees/detail/:id')
  @ApiOperation({ summary: 'Get single employee with full details' })
  getEmployee(@Param('id') id: string) {
    return this.hrService.getEmployee(id);
  }

  @Put('employees/:id')
  @ApiOperation({ summary: 'Update employee' })
  updateEmployee(@Param('id') id: string, @Body() body: any) {
    return this.hrService.updateEmployee(id, body);
  }

  // ─── ATTENDANCE ────────────────────────────────────────────────
  @Get('attendance/:companyId')
  @ApiOperation({ summary: 'Get attendance records' })
  @ApiQuery({ name: 'date', required: false })
  getAttendance(@Param('companyId') companyId: string, @Query('date') date?: string) {
    return this.hrService.getAttendance(companyId, date);
  }

  @Post('attendance/:employeeId')
  @ApiOperation({ summary: 'Mark attendance for employee' })
  markAttendance(@Param('employeeId') employeeId: string, @Body() body: any) {
    return this.hrService.markAttendance(employeeId, body);
  }

  // ─── LEAVES ────────────────────────────────────────────────────
  @Get('leaves/:companyId')
  @ApiOperation({ summary: 'Get all leave requests' })
  getLeaves(@Param('companyId') companyId: string) {
    return this.hrService.getLeaves(companyId);
  }

  @Post('leaves')
  @ApiOperation({ summary: 'Submit a leave request' })
  createLeave(@Body() body: any) {
    return this.hrService.createLeave(body);
  }

  @Put('leaves/:id/status')
  @ApiOperation({ summary: 'Approve or reject a leave request' })
  updateLeaveStatus(@Param('id') id: string, @Body() body: { status: any }) {
    return this.hrService.updateLeaveStatus(id, body.status);
  }

  // ─── PAYROLL ────────────────────────────────────────────────────
  @Get('payroll/:companyId')
  @ApiOperation({ summary: 'Get payroll records' })
  @ApiQuery({ name: 'year', required: false })
  getPayrolls(@Param('companyId') companyId: string, @Query('year') year?: string) {
    return this.hrService.getPayrolls(companyId, year ? +year : undefined);
  }

  @Post('payroll/generate/:companyId')
  @ApiOperation({ summary: 'Auto-generate payroll for all active employees' })
  generatePayroll(@Param('companyId') companyId: string, @Body() body: { month: number; year: number }) {
    return this.hrService.generatePayroll(companyId, body.month, body.year);
  }

  @Put('payroll/:id/approve')
  @ApiOperation({ summary: 'Approve a payroll record' })
  approvePayroll(@Param('id') id: string) {
    return this.hrService.approvePayroll(id);
  }

  // ─── GENERIC DYNAMIC MODULE DATA ───────────────────────────────
  @Get(':moduleSlug')
  @ApiOperation({ summary: 'Get generic HR module data' })
  async getModuleData(@Param('moduleSlug') moduleSlug: string, @Request() req: any) {
    // Avoid conflicting with fixed routes
    if (['stats', 'departments', 'employees', 'attendance', 'leaves', 'payroll'].includes(moduleSlug)) {
      return { data: [] };
    }
    const companyId = req.user.companyId;
    const data = await this.hrService.getHrModuleData(moduleSlug, companyId);
    return { data };
  }

  @Post(':moduleSlug')
  @ApiOperation({ summary: 'Create generic HR module data' })
  async createModuleData(@Param('moduleSlug') moduleSlug: string, @Body() data: any, @Request() req: any) {
    const companyId = req.user.companyId;
    const result = await this.hrService.createHrModuleData(moduleSlug, companyId, data);
    return { success: true, data: result };
  }
}
