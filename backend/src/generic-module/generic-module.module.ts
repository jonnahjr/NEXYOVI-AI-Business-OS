import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GenericModuleController } from './generic-module.controller';
import { GenericModuleService } from './generic-module.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'nexyovi-secret',
    }),
  ],
  controllers: [GenericModuleController],
  providers: [GenericModuleService, JwtAuthGuard],
})
export class GenericModuleModule {}
