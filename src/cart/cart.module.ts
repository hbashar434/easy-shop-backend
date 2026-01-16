import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Module({
  imports: [PrismaModule],
  controllers: [CartController],
  providers: [CartService, JwtAuthGuard],
  exports: [CartService],
})
export class CartModule {}
