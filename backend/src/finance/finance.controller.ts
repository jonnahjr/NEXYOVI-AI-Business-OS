import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FinanceService } from './finance.service';

@ApiTags('Finance')
@ApiBearerAuth()
@Controller('finance')
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  @Get('stats/:companyId')
  @ApiOperation({ summary: 'Finance dashboard stats' })
  getStats(@Param('companyId') companyId: string) {
    return this.financeService.getStats(companyId);
  }

  // Invoices
  @Get('invoices/:companyId')
  @ApiOperation({ summary: 'Get all invoices' })
  getInvoices(@Param('companyId') companyId: string) {
    return this.financeService.getInvoices(companyId);
  }

  @Get('invoices/detail/:id')
  @ApiOperation({ summary: 'Get invoice detail' })
  getInvoice(@Param('id') id: string) {
    return this.financeService.getInvoice(id);
  }

  @Post('invoices/:companyId')
  @ApiOperation({ summary: 'Create invoice (auto-calculates tax)' })
  createInvoice(@Param('companyId') companyId: string, @Body() body: any) {
    return this.financeService.createInvoice(companyId, body);
  }

  @Put('invoices/:id/status')
  @ApiOperation({ summary: 'Update invoice status' })
  updateStatus(@Param('id') id: string, @Body() body: { status: any }) {
    return this.financeService.updateInvoiceStatus(id, body.status);
  }

  @Delete('invoices/:id')
  @ApiOperation({ summary: 'Delete invoice' })
  deleteInvoice(@Param('id') id: string) {
    return this.financeService.deleteInvoice(id);
  }

  // Expenses
  @Get('expenses/:companyId')
  @ApiOperation({ summary: 'Get all expenses' })
  getExpenses(@Param('companyId') companyId: string) {
    return this.financeService.getExpenses(companyId);
  }

  @Post('expenses/:companyId')
  @ApiOperation({ summary: 'Create expense' })
  createExpense(@Param('companyId') companyId: string, @Body() body: any) {
    return this.financeService.createExpense(companyId, body);
  }

  @Put('expenses/:id/status')
  @ApiOperation({ summary: 'Approve/reject expense' })
  updateExpenseStatus(@Param('id') id: string, @Body() body: { status: any }) {
    return this.financeService.updateExpenseStatus(id, body.status);
  }

  @Delete('expenses/:id')
  @ApiOperation({ summary: 'Delete expense' })
  deleteExpense(@Param('id') id: string) {
    return this.financeService.deleteExpense(id);
  }

  // Reports
  @Get('reports/monthly/:companyId')
  @ApiOperation({ summary: 'Get monthly P&L report for a year' })
  @ApiQuery({ name: 'year', required: false })
  getMonthlyReport(@Param('companyId') companyId: string, @Query('year') year?: string) {
    return this.financeService.getMonthlyReport(companyId, year ? +year : new Date().getFullYear());
  }
}
