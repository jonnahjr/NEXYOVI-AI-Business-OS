import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, BadRequestException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GenericModuleService } from './generic-module.service';
import { EmailService } from '../email/email.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Generic Modules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('modules')
export class GenericModuleController {
  constructor(
    private readonly genericModuleService: GenericModuleService,
    private readonly emailService: EmailService,
  ) {}

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

  // ── INVOICE STATS ──────────────────────────────────────────────────────

  @Get('crm-sales/invoicing/stats')
  @ApiOperation({ summary: 'Get invoice statistics: total outstanding, monthly revenue, overdue amounts' })
  async getInvoiceStats(@Request() req: any) {
    const companyId = req.user?.companyId;
    const stats = await this.genericModuleService.getInvoiceStats(companyId);
    return { success: true, data: stats };
  }

  @Get('finance-accounting/invoicing/stats')
  @ApiOperation({ summary: 'Get invoice statistics for finance pillar' })
  async getFinanceInvoiceStats(@Request() req: any) {
    const companyId = req.user?.companyId;
    const stats = await this.genericModuleService.getInvoiceStats(companyId);
    return { success: true, data: stats };
  }

  // ── MARK AP/AR INVOICE AS PAID ────────────────────────────────────────

  @Put('finance-accounting/accounts-payable/:id/pay')
  @ApiOperation({ summary: 'Mark an accounts payable invoice as paid' })
  async markApPaid(@Param('id') id: string, @Request() req: any) {
    const companyId = req.user?.companyId;
    const result = await this.genericModuleService.markInvoicePaid(id, companyId);
    return { success: true, data: result };
  }

  @Put('finance-accounting/accounts-receivable/:id/pay')
  @ApiOperation({ summary: 'Mark an accounts receivable invoice as paid' })
  async markArPaid(@Param('id') id: string, @Request() req: any) {
    const companyId = req.user?.companyId;
    const result = await this.genericModuleService.markInvoicePaid(id, companyId);
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
  @ApiOperation({ summary: 'Get data for any pillar/module. Supports ?search=term for employee/product/warehouse search.' })
  async getData(
    @Param('pillarSlug') pillarSlug: string,
    @Param('moduleSlug') moduleSlug: string,
    @Request() req: any,
    @Query('search') search?: string,
  ) {
    const companyId = req.user?.companyId;
    if (search) {
      if (pillarSlug === 'human-resources' && moduleSlug === 'employee-management') {
        const data = await this.genericModuleService.searchEmployees(companyId, search);
        return { data };
      }
      if (pillarSlug === 'inventory-warehouse' && moduleSlug === 'products') {
        const data = await this.genericModuleService.searchProducts(companyId, search);
        return { data };
      }
      if (pillarSlug === 'inventory-warehouse' && moduleSlug === 'warehouses') {
        const data = await this.genericModuleService.searchWarehouses(companyId, search);
        return { data };
      }
      if (pillarSlug === 'manufacturing' && (moduleSlug === 'machine-monitoring' || moduleSlug === 'maintenance' || moduleSlug === 'production-scheduling')) {
        const data = await this.genericModuleService.searchMachines(companyId, search);
        return { data };
      }
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

  // ── INVOICE EMAIL ───────────────────────────────────────────────────────

  @Post('crm-sales/invoicing/:id/send-email')
  @ApiOperation({ summary: 'Send invoice as email to customer' })
  async sendInvoiceEmail(
    @Param('id') id: string,
    @Body() body: { to?: string; pdfBase64?: string },
    @Request() req: any,
  ) {
    const companyId = req.user?.companyId;
    // Fetch invoice with items
    const invoice = await this.genericModuleService.getDataById('crm-sales', 'invoicing', id, companyId);
    if (!invoice) throw new BadRequestException('Invoice not found');
    if (!body.to && !invoice.customerEmail) throw new BadRequestException('Recipient email is required');

    await this.emailService.sendInvoiceEmail({
      to: body.to || invoice.customerEmail || '',
      invoiceNo: invoice.invoiceNo || '',
      customer: invoice.customer || '',
      issueDate: invoice.issueDate || '',
      dueDate: invoice.dueDate || '',
      total: invoice.total || 0,
      status: invoice.status || '',
      items: (invoice.items || []).map((item: any) => ({
        description: item.description || '',
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        total: item.total || 0,
      })),
      notes: invoice.notes || '',
      pdfBase64: body.pdfBase64,
    });

    // Update status to SENT if it was DRAFT
    if (invoice.status === 'Draft') {
      try {
        await this.genericModuleService.updateData('crm-sales', 'invoicing', id, companyId, { status: 'SENT' });
      } catch { /* non-critical */ }
    }

    return { success: true, message: `Invoice ${invoice.invoiceNo} sent to ${body.to || invoice.customerEmail}` };
  }

  // ── LEAD ACTIVITIES ─────────────────────────────────────────────────────

  @Get('crm-sales/lead-management/:leadId/activities')
  @ApiOperation({ summary: 'Get all activities for a lead' })
  async getLeadActivities(
    @Param('leadId') leadId: string,
  ) {
    const data = await this.genericModuleService.getLeadActivities(leadId);
    return { data };
  }

  @Post('crm-sales/lead-management/:leadId/activities')
  @ApiOperation({ summary: 'Create an activity for a lead (call, email, meeting, note, task)' })
  async createLeadActivity(
    @Param('leadId') leadId: string,
    @Body() body: { type: string; title: string; notes?: string; outcome?: string; date?: string },
  ) {
    const result = await this.genericModuleService.createLeadActivity(leadId, body);
    return { success: true, data: result };
  }

  @Delete('crm-sales/lead-management/:leadId/activities/:activityId')
  @ApiOperation({ summary: 'Delete a lead activity' })
  async deleteLeadActivity(
    @Param('leadId') leadId: string,
    @Param('activityId') activityId: string,
  ) {
    const result = await this.genericModuleService.deleteLeadActivity(activityId);
    return { success: true, data: result };
  }

  // ── GENERATE DEMO DATA ─────────────────────────────────────────────────

  @Post(':pillarSlug/:moduleSlug/generate-demo')
  @ApiOperation({ summary: 'Generate demo data for any finance module' })
  async generateDemoData(
    @Param('pillarSlug') pillarSlug: string,
    @Param('moduleSlug') moduleSlug: string,
    @Request() req: any,
  ) {
    const companyId = req.user?.companyId;
    if (!companyId) throw new BadRequestException('Company ID required');
    const result = await this.genericModuleService.generateDemoData(pillarSlug, moduleSlug, companyId);
    return { success: true, data: result };
  }
}
