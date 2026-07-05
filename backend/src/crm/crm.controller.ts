import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CrmService } from './crm.service';

@ApiTags('CRM')
@ApiBearerAuth()
@Controller('crm')
export class CrmController {
  constructor(private crmService: CrmService) {}

  @Get('stats/:companyId')
  @ApiOperation({ summary: 'CRM dashboard stats' })
  getStats(@Param('companyId') companyId: string) {
    return this.crmService.getCrmStats(companyId);
  }

  // Customers
  @Get('customers/:companyId')
  @ApiOperation({ summary: 'Get all customers' })
  getCustomers(@Param('companyId') companyId: string) {
    return this.crmService.getCustomers(companyId);
  }

  @Get('customers/detail/:id')
  @ApiOperation({ summary: 'Get customer detail' })
  getCustomer(@Param('id') id: string) {
    return this.crmService.getCustomer(id);
  }

  @Post('customers/:companyId')
  @ApiOperation({ summary: 'Create customer' })
  createCustomer(@Param('companyId') companyId: string, @Body() body: any) {
    return this.crmService.createCustomer(companyId, body);
  }

  @Put('customers/:id')
  @ApiOperation({ summary: 'Update customer' })
  updateCustomer(@Param('id') id: string, @Body() body: any) {
    return this.crmService.updateCustomer(id, body);
  }

  @Delete('customers/:id')
  @ApiOperation({ summary: 'Delete customer' })
  deleteCustomer(@Param('id') id: string) {
    return this.crmService.deleteCustomer(id);
  }

  // Leads
  @Get('leads/:companyId')
  @ApiOperation({ summary: 'Get all leads' })
  getLeads(@Param('companyId') companyId: string) {
    return this.crmService.getLeads(companyId);
  }

  @Post('leads/:companyId')
  @ApiOperation({ summary: 'Create lead' })
  createLead(@Param('companyId') companyId: string, @Body() body: any) {
    return this.crmService.createLead(companyId, body);
  }

  @Put('leads/:id')
  @ApiOperation({ summary: 'Update lead' })
  updateLead(@Param('id') id: string, @Body() body: any) {
    return this.crmService.updateLead(id, body);
  }

  @Delete('leads/:id')
  @ApiOperation({ summary: 'Delete lead' })
  deleteLead(@Param('id') id: string) {
    return this.crmService.deleteLead(id);
  }

  // Deals / Pipeline
  @Get('deals/:companyId')
  @ApiOperation({ summary: 'Get deals pipeline' })
  getDeals(@Param('companyId') companyId: string) {
    return this.crmService.getDeals(companyId);
  }

  @Post('deals/:companyId')
  @ApiOperation({ summary: 'Create deal' })
  createDeal(@Param('companyId') companyId: string, @Body() body: any) {
    return this.crmService.createDeal(companyId, body);
  }

  @Put('deals/:id')
  @ApiOperation({ summary: 'Update deal / move pipeline stage' })
  updateDeal(@Param('id') id: string, @Body() body: any) {
    return this.crmService.updateDeal(id, body);
  }

  @Delete('deals/:id')
  @ApiOperation({ summary: 'Delete deal' })
  deleteDeal(@Param('id') id: string) {
    return this.crmService.deleteDeal(id);
  }
}
