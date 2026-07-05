import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiEngineService {
  constructor(private prisma: PrismaService) {}

  async getDefaultCompanyId(): Promise<string> {
    const company = await this.prisma.company.findFirst();
    if (!company) throw new NotFoundException('No company found');
    return company.id;
  }

  async getAiModuleData(moduleSlug: string, companyId: string) {
    switch (moduleSlug) {
      case 'ai-ceo':
        return this.prisma.aiCeoObjective.findMany({ where: { companyId } });
      case 'ai-copilot':
        return this.prisma.aiCopilotSession.findMany({ where: { companyId } });
      case 'ai-agents':
        return this.prisma.aiAgent.findMany({ where: { companyId } });
      case 'ai-workflow-builder':
        return this.prisma.aiWorkflow.findMany({ where: { companyId } });
      case 'ai-voice-assistant':
        return this.prisma.aiVoiceCall.findMany({ where: { companyId } });
      case 'ai-knowledge-base':
        return this.prisma.aiKnowledgeSource.findMany({ where: { companyId } });
      case 'ai-document-intelligence':
        return this.prisma.aiDocumentJob.findMany({ where: { companyId } });
      case 'ai-analytics':
        return this.prisma.aiAnalyticsMetric.findMany({ where: { companyId } });
      case 'ai-automation':
        return this.prisma.aiAutomationTask.findMany({ where: { companyId } });
      case 'ai-decision-engine':
        return this.prisma.aiDecisionLog.findMany({ where: { companyId } });
      default:
        throw new NotFoundException(`Unknown AI module: ${moduleSlug}`);
    }
  }

  async createAiModuleData(moduleSlug: string, companyId: string, data: any) {
    // Basic mock creation for demo purposes to allow UI to add new records
    switch (moduleSlug) {
      case 'ai-ceo':
        return this.prisma.aiCeoObjective.create({ data: { ...data, companyId } });
      case 'ai-copilot':
        return this.prisma.aiCopilotSession.create({ data: { ...data, companyId } });
      case 'ai-agents':
        return this.prisma.aiAgent.create({ data: { ...data, companyId } });
      case 'ai-workflow-builder':
        return this.prisma.aiWorkflow.create({ data: { ...data, companyId } });
      case 'ai-voice-assistant':
        return this.prisma.aiVoiceCall.create({ data: { ...data, companyId } });
      case 'ai-knowledge-base':
        return this.prisma.aiKnowledgeSource.create({ data: { ...data, companyId } });
      case 'ai-document-intelligence':
        return this.prisma.aiDocumentJob.create({ data: { ...data, companyId } });
      case 'ai-analytics':
        return this.prisma.aiAnalyticsMetric.create({ data: { ...data, companyId } });
      case 'ai-automation':
        return this.prisma.aiAutomationTask.create({ data: { ...data, companyId } });
      case 'ai-decision-engine':
        return this.prisma.aiDecisionLog.create({ data: { ...data, companyId } });
      default:
        throw new NotFoundException(`Unknown AI module: ${moduleSlug}`);
    }
  }

  async generateChatResponse(moduleSlug: string, message: string, history: any[], companyId: string) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { 
        text: 'API Key is missing! Please configure GEMINI_API_KEY in the backend .env file to enable SASA.',
        role: 'ai'
      };
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `You are SASA, the AI Assistant for Nexyovi AI OS. 
      The user is currently viewing the "${moduleSlug}" module. 
      Help them analyze data, generate reports, or answer questions. 
      Be concise, professional, and act as an expert ERP system assistant.`;

      // Convert history to Gemini format (user/model)
      const contents = history.map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));
      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: { systemInstruction }
      });

      return {
        text: response.text,
        role: 'ai'
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      return {
        text: 'Sorry, I encountered an error communicating with the AI service. Please try again.',
        role: 'ai'
      };
    }
  }
}
