import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Module({
  imports: [PrismaModule],
  controllers: [AddressController],
  providers: [AddressService, JwtAuthGuard],
  exports: [AddressService],
})
export class AddressModule {}
