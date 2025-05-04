import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import {
  MailData,
  MailPriority,
  BatchMailResponse,
} from './interfaces/mail.interface';
import { validate as validateEmail } from 'email-validator';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly priorityMap: Record<MailPriority, number> = {
    high: 1,
    normal: 2,
    low: 3,
  };
  private readonly sendMail: boolean;
  private readonly onlyEmails: string[];
  private readonly DEFAULT_CHUNK_SIZE = 10;
  private readonly MAX_RETRIES = 3;
  private isRedisAvailable = true;

  constructor(
    private readonly mailerService: MailerService,
    @InjectQueue('mail') private readonly mailQueue: Queue,
    private readonly configService: ConfigService,
  ) {
    const sendMailConfig = this.configService.get<string>('SEND_MAIL');
    this.sendMail = sendMailConfig === 'true';

    const onlyEmailsStr = this.configService.get<string>('ONLY_MAILS');
    this.onlyEmails = onlyEmailsStr ? onlyEmailsStr.split(',') : [];

    void this.initializeService();
  }

  private async initializeService(): Promise<void> {
    this.validateConfig();
    await this.checkRedisConnection();
  }

  private validateConfig(): void {
    const requiredConfigs = ['MAIL_HOST', 'MAIL_USER', 'MAIL_PASSWORD'];
    const missingConfigs = requiredConfigs.filter(
      (config) => !this.configService.get<string>(config),
    );

    if (missingConfigs.length) {
      throw new Error(
        `Missing mail configurations: ${missingConfigs.join(', ')}`,
      );
    }
  }

  private async checkRedisConnection(): Promise<void> {
    try {
      await this.mailQueue.client.ping();
      this.isRedisAvailable = true;
      this.logger.log('Redis connection successful');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.isRedisAvailable = false;
      this.logger.warn(
        `Redis is not available, falling back to direct email sending: ${errorMessage}`,
        errorStack,
      );
    }
  }

  private getTargetEmails(originalTo: string): string[] {
    return this.onlyEmails.length > 0 ? this.onlyEmails : [originalTo];
  }

  private async processMailChunk(
    chunk: MailData[],
    response: BatchMailResponse,
  ): Promise<void> {
    await Promise.all(
      chunk.map(async (mail) => {
        try {
          await this.validateAndQueueMail(mail, response);
        } catch (error: unknown) {
          this.handleMailError(mail, error, response);
        } finally {
          response.totalProcessed++;
        }
      }),
    );
  }

  private async validateAndQueueMail(
    mail: MailData,
    response: BatchMailResponse,
  ): Promise<void> {
    if (!this.isValidEmail(mail.to)) {
      throw new Error(`Invalid email address: ${mail.to}`);
    }

    const targetEmails = this.getTargetEmails(mail.to);
    await this.queueEmails(mail, targetEmails);
    response.success.push(mail);
  }

  private isValidEmail(email: string): boolean {
    return validateEmail(email);
  }

  private handleMailError(
    mail: MailData,
    error: unknown,
    response: BatchMailResponse,
  ): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    this.logger.error(`Failed to process email: ${errorMessage}`, errorStack);
    response.failed.push({
      mail,
      error: errorMessage,
    });
  }

  async sendMails(mailData: MailData | MailData[]): Promise<BatchMailResponse> {
    const response = this.initializeResponse();

    try {
      if (!this.sendMail) {
        this.logger.log('Email sending is disabled');
        return response;
      }

      const mailsToProcess = Array.isArray(mailData) ? mailData : [mailData];
      await this.processMailsInChunks(mailsToProcess, response);

      return response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Mail processing error: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  private initializeResponse(): BatchMailResponse {
    return {
      success: [],
      failed: [],
      totalProcessed: 0,
      metrics: {
        startTime: Date.now(),
        processingTime: 0,
      },
    };
  }

  private async processMailsInChunks(
    mails: MailData[],
    response: BatchMailResponse,
  ): Promise<void> {
    for (let i = 0; i < mails.length; i += this.DEFAULT_CHUNK_SIZE) {
      const chunk = mails.slice(i, i + this.DEFAULT_CHUNK_SIZE);
      await this.processMailChunk(chunk, response);
    }
    response.metrics.processingTime = Date.now() - response.metrics.startTime;
  }

  private async sendDirectEmail(mail: MailData): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: mail.to,
        subject: mail.subject,
        template: mail.template,
        context: mail.context,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to send email directly: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  private async queueEmails(
    mail: MailData,
    targetEmails: string[],
  ): Promise<void> {
    const queueOptions = {
      attempts: this.MAX_RETRIES,
      backoff: {
        type: 'exponential' as const,
        delay: 1000,
      },
      priority: this.priorityMap[mail.priority || 'normal'],
    };

    await Promise.all(
      targetEmails.map(async (targetEmail) => {
        const emailData: MailData = { ...mail, to: targetEmail };

        if (!this.isRedisAvailable) {
          // Fallback to direct email sending if Redis is not available
          return this.sendDirectEmail(emailData);
        }

        try {
          await this.mailQueue.add('send-mail', emailData, queueOptions);
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.logger.warn(
            `Queue operation failed for ${targetEmail}, falling back to direct email sending: ${errorMessage}`,
          );
          await this.sendDirectEmail(emailData);
        }
      }),
    );
  }
}
