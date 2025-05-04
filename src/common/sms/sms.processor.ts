import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import { SmsData } from './interfaces/sms.interface';

@Processor('sms')
export class SmsProcessor {
  private readonly logger = new Logger(SmsProcessor.name);

  constructor(private readonly configService: ConfigService) {}

  @Process({
    name: 'send-sms',
    concurrency: 5,
  })
  async handleSmsSending(job: Job<SmsData>) {
    const { data } = job;
    const startTime = Date.now();

    try {
      const apiKey = this.configService.get<string>('SMS_API_KEY');
      const apiUrl = `http://portal.jadusms.com/smsapi/non-masking?api_key=${apiKey}&smsType=text&mobileNo=${data.to}&smsContent=${encodeURIComponent(data.content)}`;

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
    } catch (error) {
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

    // Add conditions for temporary errors that should trigger a retry
    return (
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ECONNRESET') ||
      error.message.toLowerCase().includes('rate limit')
    );
  }
}
