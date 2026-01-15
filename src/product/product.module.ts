import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [PrismaModule],
  controllers: [ProductController],
  providers: [ProductService, JwtAuthGuard, RolesGuard],
  exports: [ProductService],
})
export class ProductModule {}

