import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Job } from 'bull';
import { MailData } from './interfaces/mail.interface';

interface MailError extends Error {
  code?: string;
}

@Processor('mail')
export class MailProcessor {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private mailerService: MailerService) {}

  @Process({
    name: 'send-mail',
    concurrency: 5,
  })
  async handleMailSending(job: Job<MailData>) {
    const { data } = job;
    const startTime = Date.now();

    try {
      await this.mailerService.sendMail({
        to: data.to,
        subject: data.subject,
        template: data.template,
        context: data.context,
      });

      const processingTime = Date.now() - startTime;
      this.logger.log(
        `Email sent successfully to ${data.to} (took ${processingTime}ms)`,
      );

      return { success: true, processingTime };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to send email to ${data.to}: ${errorMessage}`,
        errorStack,
      );

      if (this.isTemporaryError(error)) {
        throw error;
      }

      return { success: false, error: errorMessage };
    }
  }

  private isTemporaryError(error: unknown): boolean {
    const temporaryErrorCodes = [
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ECONNRESET',
      'ESOCKET',
    ];

    if (!(error instanceof Error)) {
      return false;
    }

    const mailError = error as MailError;
    return (
      (mailError.code && temporaryErrorCodes.includes(mailError.code)) ||
      mailError.message.includes('rate limit')
    );
  }
}
