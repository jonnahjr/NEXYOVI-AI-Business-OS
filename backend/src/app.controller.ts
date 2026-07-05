import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Health check' })
  health() {
    return {
      status: 'online',
      system: 'NEXYOVI AI Business OS',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/api/v1/auth',
        users: '/api/v1/users',
        hr: '/api/v1/hr',
        crm: '/api/v1/crm',
        inventory: '/api/v1/inventory',
        finance: '/api/v1/finance',
        docs: '/api',
      },
    };
  }
}
