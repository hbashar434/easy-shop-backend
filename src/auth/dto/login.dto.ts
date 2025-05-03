import { IsString, MinLength, IsEmail, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EmailPasswordLoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}

export class EmailOtpLoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Verification code (6 digits)',
    required: false,
  })
  @IsString()
  @Matches(/^\d{6}$/, {
    message: 'Verification code must be 6 digits',
  })
  verificationCode?: string;
}

export class PhonePasswordLoginDto {
  @ApiProperty({
    example: '+8801712345678',
    description: 'Phone number in international format',
  })
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message:
      'Phone number must be in international format (e.g., +8801712345678)',
  })
  phone: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}

export class PhoneOtpLoginDto {
  @ApiProperty({
    example: '+8801712345678',
    description: 'Phone number in international format',
  })
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message:
      'Phone number must be in international format (e.g., +8801712345678)',
  })
  phone: string;

  @ApiProperty({
    example: '123456',
    description: 'Verification code (6 digits)',
    required: false,
  })
  @IsString()
  @Matches(/^\d{6}$/, {
    message: 'Verification code must be 6 digits',
  })
  verificationCode?: string;
}
