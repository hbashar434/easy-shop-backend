import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [PrismaModule],
  controllers: [BrandController],
  providers: [BrandService, JwtAuthGuard, RolesGuard],
  exports: [BrandService],
})
export class BrandModule {}

