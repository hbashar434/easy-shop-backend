import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { SmsService } from './sms.service';
import { SmsProcessor } from './sms.processor';
import { SmsController } from './sms.controller';

@Global()
@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: 'sms',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
      },
    }),
  ],
  controllers: [SmsController],
  providers: [SmsService, SmsProcessor],
  exports: [SmsService],
})
export class SmsModule {}
