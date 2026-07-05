import { Controller, Get, Post, Param, Body, Request } from '@nestjs/common';
import { AiEngineService } from './ai-engine.service';

@Controller('ai-core')
export class AiEngineController {
  constructor(private readonly aiEngineService: AiEngineService) {}

  @Get(':moduleSlug')
  async getModuleData(@Param('moduleSlug') moduleSlug: string, @Request() req: any) {
    if (moduleSlug === 'chat') return { data: [] }; // Prevent /chat from hitting getModuleData
    // Mock user for now since JWT is disabled
    const companyId = req.user?.companyId || (await this.aiEngineService.getDefaultCompanyId());
    const data = await this.aiEngineService.getAiModuleData(moduleSlug, companyId);
    return { data };
  }

  @Post('chat')
  async chat(@Body() body: any, @Request() req: any) {
    const { moduleSlug, message, history } = body;
    const companyId = req.user?.companyId || (await this.aiEngineService.getDefaultCompanyId());
    const response = await this.aiEngineService.generateChatResponse(moduleSlug, message, history || [], companyId);
    return response;
  }

  @Post(':moduleSlug')
  async createModuleData(@Param('moduleSlug') moduleSlug: string, @Body() data: any, @Request() req: any) {
    const companyId = req.user?.companyId || (await this.aiEngineService.getDefaultCompanyId());
    const result = await this.aiEngineService.createAiModuleData(moduleSlug, companyId, data);
    return { data: result };
  }
}
