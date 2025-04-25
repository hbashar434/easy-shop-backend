import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsObject,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { MailPriority } from '../interfaces/mail.interface';

export class SendMailDto {
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  template: string;

  @IsObject()
  @IsNotEmpty()
  context: Record<string, any>;

  @IsEnum(['high', 'normal', 'low'])
  @IsOptional()
  priority?: MailPriority;
}

export class SendBulkMailDto {
  @IsNotEmpty()
  emails: SendMailDto[];
}
