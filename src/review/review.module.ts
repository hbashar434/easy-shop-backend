import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [PrismaModule],
  controllers: [ReviewController],
  providers: [ReviewService, JwtAuthGuard, RolesGuard],
  exports: [ReviewService],
})
export class ReviewModule {}
