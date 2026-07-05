import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UploadController } from './upload.controller';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'nexyovi-secret',
    }),
  ],
  controllers: [UploadController],
  providers: [JwtAuthGuard],
})
export class UploadModule {}
