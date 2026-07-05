import { Controller, Get, Post, Put, Delete, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GenericModuleService } from './generic-module.service';

@ApiTags('Generic Modules')
@ApiBearerAuth()
@Controller('modules')
export class GenericModuleController {
  constructor(private readonly genericModuleService: GenericModuleService) {}

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

  @Get(':pillarSlug/:moduleSlug')
  @ApiOperation({ summary: 'Get data for any pillar/module' })
  async getData(
    @Param('pillarSlug') pillarSlug: string,
    @Param('moduleSlug') moduleSlug: string,
    @Request() req: any,
  ) {
    const companyId = req.user?.companyId;
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
