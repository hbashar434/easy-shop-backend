import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { LocalUploadStrategy } from './strategies/local.strategy';
import { CloudUploadStrategy } from './strategies/cloud.strategy';

@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [
    UploadService,
    LocalUploadStrategy,
    CloudUploadStrategy,
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
})
export class UploadModule {}
