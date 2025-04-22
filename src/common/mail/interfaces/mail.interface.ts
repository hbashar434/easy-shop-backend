export interface MailData {
  to: string | string[];
  subject: string;
  template: string;
  context?: Record<string, any>;
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
