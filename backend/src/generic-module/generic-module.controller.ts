import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, BadRequestException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GenericModuleService } from './generic-module.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Generic Modules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('modules')
export class GenericModuleController {
  constructor(private readonly genericModuleService: GenericModuleService) {}

  // ── SPECIFIC ROUTES (must come BEFORE generic :id routes) ──────────────

  @Get('human-resources/payroll/settings')
  @ApiOperation({ summary: 'Get payroll settings for the company' })
  async getPayrollSettings(@Request() req: any) {
    const companyId = req.user?.companyId;
    if (!companyId) throw new BadRequestException('Company ID required');
    const settings = await this.genericModuleService.getPayrollSettings(companyId);
    return { success: true, data: settings };
  }

  @Put('human-resources/payroll/settings')
  @ApiOperation({ summary: 'Upsert payroll settings for the company' })
  async updatePayrollSettings(@Body() body: any, @Request() req: any) {
    const companyId = req.user?.companyId;
    if (!companyId) throw new BadRequestException('Company ID required');
    const settings = await this.genericModuleService.upsertPayrollSettings(companyId, body);
    return { success: true, data: settings };
  }

  @Post('human-resources/payroll/generate')
  @ApiOperation({ summary: 'Generate payroll for all active employees for a given month/year' })
  async generatePayroll(
    @Body() body: { month: number; year: number },
    @Request() req: any,
  ) {
    const companyId = req.user?.companyId;
    if (!companyId) throw new BadRequestException('Company ID required');
    try {
      const result = await this.genericModuleService.generatePayrollForMonth(
        companyId,
        body.month || new Date().getMonth() + 1,
        body.year || new Date().getFullYear(),
      );
      return { success: true, data: result };
    } catch (err: any) {
      console.error('Payroll generate error:', err);
      throw new (await import('@nestjs/common').then(m => m.BadRequestException))(
        err?.message || 'Failed to generate payroll'
      );
    }
  }

  @Post('human-resources/recruitment-ats/:id/hire')
  @ApiOperation({ summary: 'Hire a candidate — creates an employee and updates stage to HIRED' })
  async hireCandidate(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const companyId = req.user?.companyId;
    if (!companyId) throw new BadRequestException('Company ID required');
    const result = await this.genericModuleService.hireCandidate(id, companyId);
    return { success: true, data: result };
  }

  // ── GENERIC ROUTES ─────────────────────────────────────────────────────

  @Get(':pillarSlug/:moduleSlug/count')
  @ApiOperation({ summary: 'Count records for any pillar/module' })
  async countData(
    @Param('pillarSlug') pillarSlug: string,
    @Param('moduleSlug') moduleSlug: string,
    @Request() req: any,
  ) {
    const companyId = req.user?.companyId;
    const data = await this.genericModuleService.getData(pillarSlug, moduleSlug, companyId);
    return { count: data.length };
  }

  @Get(':pillarSlug/:moduleSlug/:id')
  @ApiOperation({ summary: 'Get a single record by ID for any pillar/module' })
  async getDataById(
    @Param('pillarSlug') pillarSlug: string,
    @Param('moduleSlug') moduleSlug: string,
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const companyId = req.user?.companyId;
    const data = await this.genericModuleService.getDataById(pillarSlug, moduleSlug, id, companyId);
    return { data };
  }

  @Get(':pillarSlug/:moduleSlug')
  @ApiOperation({ summary: 'Get data for any pillar/module. Supports ?search=term for employee search.' })
  async getData(
    @Param('pillarSlug') pillarSlug: string,
    @Param('moduleSlug') moduleSlug: string,
    @Request() req: any,
    @Query('search') search?: string,
  ) {
    const companyId = req.user?.companyId;
    if (search && pillarSlug === 'human-resources' && moduleSlug === 'employee-management') {
      const data = await this.genericModuleService.searchEmployees(companyId, search);
      return { data };
    }
    const data = await this.genericModuleService.getData(pillarSlug, moduleSlug, companyId);
    return { data };
  }

  @Post(':pillarSlug/:moduleSlug')
  @ApiOperation({ summary: 'Create data for any pillar/module' })
  async createData(
    @Param('pillarSlug') pillarSlug: string,
    @Param('moduleSlug') moduleSlug: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    const companyId = req.user?.companyId;
    try {
      const result = await this.genericModuleService.createData(pillarSlug, moduleSlug, companyId, body);
      return { success: true, data: result };
    } catch (err: any) {
      throw new (await import('@nestjs/common').then(m => m.BadRequestException))(
        err?.message || 'Failed to create record'
      );
    }
  }

  @Put(':pillarSlug/:moduleSlug/:id')
  @ApiOperation({ summary: 'Update data for any pillar/module' })
  async updateData(
    @Param('pillarSlug') pillarSlug: string,
    @Param('moduleSlug') moduleSlug: string,
    @Param('id') id: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    const companyId = req.user?.companyId;
    const result = await this.genericModuleService.updateData(pillarSlug, moduleSlug, id, companyId, body);
    return { success: true, data: result };
  }

  @Delete(':pillarSlug/:moduleSlug/:id')
  @ApiOperation({ summary: 'Delete data from any pillar/module' })
  async deleteData(
    @Param('pillarSlug') pillarSlug: string,
    @Param('moduleSlug') moduleSlug: string,
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const companyId = req.user?.companyId;
    const result = await this.genericModuleService.deleteData(pillarSlug, moduleSlug, id, companyId);
    return { success: true, data: result };
  }
}
