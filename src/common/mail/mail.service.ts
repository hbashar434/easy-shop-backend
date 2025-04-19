import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { MailData } from './interfaces/mail.interface';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendMail(mailData: MailData): Promise<void> {
    await this.mailerService.sendMail({
      to: mailData.to,
      subject: mailData.subject,
      template: mailData.template,
      context: mailData.context,
    });
  }
}
