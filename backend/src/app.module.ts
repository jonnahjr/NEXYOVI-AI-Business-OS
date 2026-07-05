import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HrModule } from './hr/hr.module';
import { CrmModule } from './crm/crm.module';
import { InventoryModule } from './inventory/inventory.module';
import { FinanceModule } from './finance/finance.module';
import { ProcurementModule } from './procurement/procurement.module';
import { ManufacturingModule } from './manufacturing/manufacturing.module';
import { ProjectsModule } from './projects/projects.module';
import { DocumentsModule } from './documents/documents.module';
import { AiEngineModule } from './ai-engine/ai-engine.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { LogisticsModule } from './logistics/logistics.module';
import { MarketingModule } from './marketing/marketing.module';
import { EcommerceModule } from './ecommerce/ecommerce.module';
import { BiModule } from './bi/bi.module';
import { CommunicationModule } from './communication/communication.module';
import { WorkflowModule } from './workflow/workflow.module';
import { SecurityModule } from './security/security.module';
import { IndustryModule } from './industry/industry.module';
import { AiAgentsModule } from './ai-agents/ai-agents.module';
import { VendorModule } from './vendor/vendor.module';
import { FleetModule } from './fleet/fleet.module';
import { GenericModuleModule } from './generic-module/generic-module.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    HrModule,
    CrmModule,
    InventoryModule,
    FinanceModule,
    ProcurementModule,
    ManufacturingModule,
    ProjectsModule,
    DocumentsModule,
    AiEngineModule,
    AnalyticsModule,
    LogisticsModule,
    MarketingModule,
    EcommerceModule,
    BiModule,
    CommunicationModule,
    WorkflowModule,
    SecurityModule,
    IndustryModule,
    AiAgentsModule,
    VendorModule,
    FleetModule,
    GenericModuleModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
