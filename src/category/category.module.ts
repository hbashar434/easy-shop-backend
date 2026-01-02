import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [PrismaModule],
  controllers: [CategoryController],
  providers: [CategoryService, JwtAuthGuard, RolesGuard],
  exports: [CategoryService],
})
export class CategoryModule {}
