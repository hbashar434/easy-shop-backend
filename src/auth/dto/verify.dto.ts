import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Length,
  IsNotEmpty,
  Matches,
  IsPhoneNumber,
} from 'class-validator';

export class EmailVerifyRequestDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address to verify',
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class PhoneVerifyRequestDto {
  @ApiProperty({
    example: '+8801712345678',
    description: 'Phone number to verify',
  })
  @IsString()
  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;
}

export class VerifyEmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address to verify',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Verification code (6 digits)',
  })
  @IsString()
  @Length(6, 6)
  code: string;
}

export class VerifyPhoneDto {
  @ApiProperty({
    example: '+8801712345678',
    description: 'Phone number to verify',
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
  })
  @IsString()
  @Length(6, 6)
  code: string;
}
