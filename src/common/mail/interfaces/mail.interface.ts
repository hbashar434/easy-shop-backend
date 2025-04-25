export type MailPriority = 'high' | 'normal' | 'low';

export interface MailData {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
  priority?: MailPriority;
}

export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export interface MailMetrics {
  startTime: number;
  processingTime: number;
}

export interface BatchMailResponse {
  success: MailData[];
  failed: Array<{
    mail: MailData;
    error: string;
  }>;
  totalProcessed: number;
  metrics: MailMetrics;
}
