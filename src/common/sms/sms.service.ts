import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as fs from 'fs';
import * as path from 'path';
import {
  SmsData,
  SmsPriority,
  BatchSmsResponse,
} from './interfaces/sms.interface';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly priorityMap: Record<SmsPriority, number> = {
    high: 1,
    normal: 2,
    low: 3,
  };
  private readonly sendSms: boolean;
  private readonly onlyNumbers: string[];
  private readonly DEFAULT_CHUNK_SIZE = 10;
  private readonly MAX_RETRIES = 3;
  private isRedisAvailable = true;
  private readonly templatesDir: string;

  constructor(
    @InjectQueue('sms') private readonly smsQueue: Queue,
    private readonly configService: ConfigService,
  ) {
    const sendSmsConfig = this.configService.get<string>('SMS_SEND');
    this.sendSms = sendSmsConfig === 'true';

    const onlyNumbersStr = this.configService.get<string>('SMS_ONLY_NUMBERS');
    this.onlyNumbers = onlyNumbersStr ? onlyNumbersStr.split(',') : [];

    // Set up templates directory
    this.templatesDir = path.join(
      process.cwd(),
      'src',
      'common',
      'sms',
      'templates',
    );

    void this.initializeService();
  }

  private async initializeService(): Promise<void> {
    if (!this.sendSms) {
      this.logger.log('SMS sending is disabled.');
      return;
    }
    this.validateConfig();
    await this.checkRedisConnection();
  }

  private validateConfig(): void {
    const requiredConfigs = ['SMS_API_KEY'];
    const missingConfigs = requiredConfigs.filter(
      (config) => !this.configService.get<string>(config),
    );

    if (missingConfigs.length) {
      throw new Error(
        `Missing SMS configurations: ${missingConfigs.join(', ')}`,
      );
    }
  }

  private async checkRedisConnection(): Promise<void> {
    try {
      await this.smsQueue.client.ping();
      this.isRedisAvailable = true;
      this.logger.log('Redis connection successful');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.isRedisAvailable = false;
      this.logger.warn(
        `Redis is not available, falling back to direct SMS sending: ${errorMessage}`,
        errorStack,
      );
    }
  }

  private getTargetNumbers(originalTo: string): string[] {
    return this.onlyNumbers.length > 0 ? this.onlyNumbers : [originalTo];
  }

  private async processMessageChunk(
    chunk: SmsData[],
    response: BatchSmsResponse,
  ): Promise<void> {
    await Promise.all(
      chunk.map(async (sms) => {
        try {
          await this.validateAndQueueMessage(sms, response);
        } catch (error: unknown) {
          this.handleSmsError(sms, error, response);
        } finally {
          response.totalProcessed++;
        }
      }),
    );
  }

  private async validateAndQueueMessage(
    sms: SmsData,
    response: BatchSmsResponse,
  ): Promise<void> {
    if (!this.isValidPhoneNumber(sms.to)) {
      throw new Error(`Invalid phone number: ${sms.to}`);
    }

    const targetNumbers = this.getTargetNumbers(sms.to);
    await this.queueMessages(sms, targetNumbers);
    response.success.push(sms);
  }

  private isValidPhoneNumber(phone: string): boolean {
    return /^\+?[1-9]\d{1,14}$/.test(phone);
  }

  private handleSmsError(
    sms: SmsData,
    error: unknown,
    response: BatchSmsResponse,
  ): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    this.logger.error(`Failed to process SMS: ${errorMessage}`, errorStack);
    response.failed.push({
      sms,
      error: errorMessage,
    });
  }

  async sendMessages(smsData: SmsData | SmsData[]): Promise<BatchSmsResponse> {
    const response = this.initializeResponse();

    try {
      if (!this.sendSms) {
        this.logger.log('SMS sending is disabled');
        return response;
      }

      const messagesToProcess = Array.isArray(smsData) ? smsData : [smsData];
      await this.processMessagesInChunks(messagesToProcess, response);

      return response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`SMS processing error: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  private initializeResponse(): BatchSmsResponse {
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

  private async processMessagesInChunks(
    messages: SmsData[],
    response: BatchSmsResponse,
  ): Promise<void> {
    for (let i = 0; i < messages.length; i += this.DEFAULT_CHUNK_SIZE) {
      const chunk = messages.slice(i, i + this.DEFAULT_CHUNK_SIZE);
      await this.processMessageChunk(chunk, response);
    }
    response.metrics.processingTime = Date.now() - response.metrics.startTime;
  }

  private async loadTemplate(templateName: string): Promise<string> {
    const templatePath = path.join(this.templatesDir, `${templateName}.txt`);
    try {
      return await fs.promises.readFile(templatePath, 'utf-8');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to load template ${templateName}: ${errorMessage}`,
      );
      throw new Error(`Template ${templateName} not found`);
    }
  }

  private stringifyValue(value: unknown): string {
    if (value === undefined || value === null) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return '';
      }
    }

    return '';
  }

  private compileTemplate(
    template: string,
    context: Record<string, unknown>,
  ): string {
    return template.replace(
      /\{\{([^}]+)\}\}/g,
      (match: string, key: string) => {
        const trimmedKey = key.trim();
        const value = context[trimmedKey];

        return value !== undefined
          ? this.stringifyValue(value)
          : `{{${trimmedKey}}}`;
      },
    );
  }

  private async sendDirectMessage(sms: SmsData): Promise<void> {
    try {
      let content: string;

      // If template is specified, load and compile it
      if (sms.template) {
        const template = await this.loadTemplate(sms.template);
        content = this.compileTemplate(template, sms.context || {});
      } else if (sms.content) {
        content = sms.content;
      } else {
        throw new Error('No content or template provided');
      }

      const apiKey = this.configService.get<string>('SMS_API_KEY');
      if (!apiKey) {
        throw new Error('SMS API key is not configured');
      }

      const apiUrl = `http://portal.jadusms.com/smsapi/non-masking?api_key=${apiKey}&smsType=text&mobileNo=${sms.to}&smsContent=${encodeURIComponent(content)}`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await response.text();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to send SMS directly: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  private async queueMessages(
    sms: SmsData,
    targetNumbers: string[],
  ): Promise<void> {
    const queueOptions = {
      attempts: this.MAX_RETRIES,
      backoff: {
        type: 'exponential' as const,
        delay: 1000,
      },
      priority: this.priorityMap[sms.priority || 'normal'],
    };

    await Promise.all(
      targetNumbers.map(async (targetNumber) => {
        const messageData: SmsData = { ...sms, to: targetNumber };

        if (!this.isRedisAvailable) {
          // Fallback to direct SMS sending if Redis is not available
          return this.sendDirectMessage(messageData);
        }

        try {
          await this.smsQueue.add('send-sms', messageData, queueOptions);
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.logger.warn(
            `Queue operation failed for ${targetNumber}, falling back to direct SMS sending: ${errorMessage}`,
          );
          await this.sendDirectMessage(messageData);
        }
      }),
    );
  }
}
