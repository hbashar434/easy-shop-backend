import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductTagService } from './product-tag.service';
import { ProductTagController } from './product-tag.controller';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [PrismaModule],
  controllers: [ProductTagController],
  providers: [ProductTagService, JwtAuthGuard, RolesGuard],
  exports: [ProductTagService],
})
export class ProductTagModule {}

