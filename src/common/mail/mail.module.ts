import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import * as path from 'path';
import { MailService } from './mail.service';
import { MailProcessor } from './mail.processor';
import { MailController } from './mail.controller';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<number>('MAIL_PORT', 587),
          secure: configService.get<string>('MAIL_SECURE') === 'true',
          pool: true,
          maxConnections: 5,
          rateDelta: 1000,
          rateLimit: 5,
          tls: {
            ciphers:
              'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256',
            rejectUnauthorized: true,
          },
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"${configService.get<string>('MAIL_FROM_NAME', 'My Shop')}" <${configService.get<string>('MAIL_FROM')}>`,
        },
        template: {
          dir: path.join(process.cwd(), 'src', 'common', 'mail', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'mail',
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
  providers: [MailService, MailProcessor],
  controllers: [MailController],
  exports: [MailService],
})
export class MailModule {}
