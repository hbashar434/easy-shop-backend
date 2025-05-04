import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import { SmsData } from './interfaces/sms.interface';
import * as fs from 'fs';
import * as path from 'path';

@Processor('sms')
export class SmsProcessor {
  private readonly logger = new Logger(SmsProcessor.name);
  private readonly templatesDir: string;

  constructor(private readonly configService: ConfigService) {
    this.templatesDir = path.join(
      process.cwd(),
      'src',
      'common',
      'sms',
      'templates',
    );
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

  @Process({
    name: 'send-sms',
    concurrency: 5,
  })
  async handleSmsSending(job: Job<SmsData>): Promise<{
    success: boolean;
    processingTime?: number;
    response?: string;
    error?: string;
  }> {
    const { data } = job;
    const startTime = Date.now();

    try {
      let content: string;

      // If template is specified, load and compile it
      if (data.template) {
        const template = await this.loadTemplate(data.template);
        content = this.compileTemplate(template, data.context || {});
      } else if (data.content) {
        content = data.content;
      } else {
        throw new Error('No content or template provided');
      }

      const apiKey = this.configService.get<string>('SMS_API_KEY');
      if (!apiKey) {
        throw new Error('SMS API key is not configured');
      }

      const apiUrl = `http://portal.jadusms.com/smsapi/non-masking?api_key=${apiKey}&smsType=text&mobileNo=${data.to}&smsContent=${encodeURIComponent(content)}`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.text();

      const processingTime = Date.now() - startTime;
      this.logger.log(
        `SMS sent successfully to ${data.to} (took ${processingTime}ms)`,
      );

      return { success: true, processingTime, response: result };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to send SMS to ${data.to}: ${errorMessage}`,
        errorStack,
      );

      if (this.isTemporaryError(error)) {
        throw error; // Retry for temporary errors
      }

      return { success: false, error: errorMessage };
    }
  }

  private isTemporaryError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    return (
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ECONNRESET') ||
      error.message.toLowerCase().includes('rate limit')
    );
  }
}
