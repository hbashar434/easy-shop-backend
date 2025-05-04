import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  Matches,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SmsPriority } from '../interfaces/sms.interface';

export class SendSmsDto {
  @ApiProperty({
    example: '+8801712345678',
    description: 'Phone number in international format',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message:
      'Phone number must be in international format (e.g., +8801712345678)',
  })
  to: string;

  @ApiProperty({
    example: 'Your verification code is: 123456',
    description: 'SMS content',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    example: 'verification-code',
    description: 'Template name to use',
    required: false,
  })
  @IsString()
  @IsOptional()
  template?: string;

  @ApiProperty({
    example: { name: 'John', code: '123456', expiresIn: 10 },
    description: 'Template context data',
    required: false,
  })
  @IsObject()
  @IsOptional()
  context?: Record<string, unknown>;

  @ApiProperty({
    enum: ['high', 'normal', 'low'],
    description: 'SMS priority level',
    required: false,
    default: 'normal',
  })
  @IsEnum(['high', 'normal', 'low'])
  @IsOptional()
  priority?: SmsPriority;
}

export class SendBulkSmsDto {
  @ApiProperty({
    type: [SendSmsDto],
    description: 'Array of SMS messages to send',
  })
  @IsNotEmpty()
  messages: SendSmsDto[];
}
