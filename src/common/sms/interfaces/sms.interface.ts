export type SmsPriority = 'high' | 'normal' | 'low';

export interface SmsData {
  to: string;
  content: string;
  priority?: SmsPriority;
}

export interface SmsConfig {
  apiKey: string;
  from: string;
}

export interface SmsMetrics {
  startTime: number;
  processingTime: number;
}

export interface BatchSmsResponse {
  success: SmsData[];
  failed: Array<{
    sms: SmsData;
    error: string;
  }>;
  totalProcessed: number;
  metrics: SmsMetrics;
}
