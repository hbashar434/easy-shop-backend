import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { LocalUploadStrategy } from './strategies/local.strategy';
import { CloudUploadStrategy } from './strategies/cloud.strategy';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [UploadController],
  providers: [
    UploadService,
    LocalUploadStrategy,
    CloudUploadStrategy,
    JwtAuthGuard,
    RolesGuard,
    {
      provide: 'UPLOAD_STRATEGY',
      inject: [ConfigService, LocalUploadStrategy, CloudUploadStrategy],
      useFactory: (
        configService: ConfigService,
        localStrategy: LocalUploadStrategy,
        cloudStrategy: CloudUploadStrategy,
      ) => {
        const useCloud = configService.get<string>('UPLOAD_CLOUD') === 'true';
        return useCloud ? cloudStrategy : localStrategy;
      },
    },
  ],
  exports: [UploadService],
})
export class UploadModule {}
