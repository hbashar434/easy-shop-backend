import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  Matches,
  ValidateIf,
  IsNotEmpty,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';

interface HasIdentifier {
  identifier: string;
}

interface HasCode {
  code: string;
}

// For requesting verification code
export class RequestCodeDto {
  @ApiProperty({
    example: '+8801712345678 or user@example.com',
    description: 'Email address or phone number',
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf(
    (o: HasIdentifier) =>
      typeof o.identifier === 'string' && !o.identifier.includes('@'),
  )
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message:
      'Phone number must be in international format (e.g., +8801712345678)',
  })
  identifier: string;
}

// For registration with code
export class RegisterWithCodeDto {
  @ApiProperty({
    example: '+8801712345678 or user@example.com',
    description: 'Email address or phone number',
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf(
    (o: HasIdentifier) =>
      typeof o.identifier === 'string' && !o.identifier.includes('@'),
  )
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message:
      'Phone number must be in international format (e.g., +8801712345678)',
  })
  identifier: string;

  @ApiProperty({
    example: '123456',
    description: 'Verification code (6 digits)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, {
    message: 'Verification code must be 6 digits',
  })
  code: string;
}

// For password-based login
export class PasswordLoginDto {
  @ApiProperty({
    example: '+8801712345678 or user@example.com',
    description: 'Email address or phone number',
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf(
    (o: HasIdentifier) =>
      typeof o.identifier === 'string' && !o.identifier.includes('@'),
  )
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message:
      'Phone number must be in international format (e.g., +8801712345678)',
  })
  identifier: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}

// For OTP-based login
export class OtpLoginDto {
  @ApiProperty({
    example: '+8801712345678 or user@example.com',
    description: 'Email address or phone number',
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf(
    (o: HasIdentifier) =>
      typeof o.identifier === 'string' && !o.identifier.includes('@'),
  )
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message:
      'Phone number must be in international format (e.g., +8801712345678)',
  })
  identifier: string;

  @ApiProperty({
    example: '123456',
    description: 'OTP code (6 digits)',
    required: false,
  })
  @IsString()
  @ValidateIf((o: HasCode) => typeof o.code === 'string' && o.code.length > 0)
  @Matches(/^\d{6}$/, {
    message: 'Verification code must be 6 digits',
  })
  code?: string;
}

// For verification
export class RequestVerifyDto {
  @ApiProperty({
    example: '+8801712345678 or user@example.com',
    description: 'Email or phone number to verify',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;
}

export class VerifyDto {
  @ApiProperty({
    example: '+8801712345678 or user@example.com',
    description: 'Email address or phone number',
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf(
    (o: HasIdentifier) =>
      typeof o.identifier === 'string' && !o.identifier.includes('@'),
  )
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message:
      'Phone number must be in international format (e.g., +8801712345678)',
  })
  identifier: string;

  @ApiProperty({
    example: '123456',
    description: 'Verification code (6 digits)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, {
    message: 'Verification code must be 6 digits',
  })
  code: string;
}

// For password reset request
export class RequestPasswordResetDto {
  @ApiProperty({
    example: '+8801712345678 or user@example.com',
    description: 'Email address or phone number',
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf(
    (o: HasIdentifier) =>
      typeof o.identifier === 'string' && !o.identifier.includes('@'),
  )
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message:
      'Phone number must be in international format (e.g., +8801712345678)',
  })
  identifier: string;
}

// For password reset
export class ResetPasswordDto {
  @ApiProperty({
    example: '+8801712345678 or user@example.com',
    description: 'Email address or phone number',
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf(
    (o: HasIdentifier) =>
      typeof o.identifier === 'string' && !o.identifier.includes('@'),
  )
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message:
      'Phone number must be in international format (e.g., +8801712345678)',
  })
  identifier: string;

  @ApiProperty({
    example: '123456',
    description: 'Reset code (6 digits)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, {
    message: 'Verification code must be 6 digits',
  })
  code: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'New password - minimum 8 characters',
  })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  newPassword: string;
}
