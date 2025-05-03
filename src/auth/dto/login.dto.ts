import { IsString, MinLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com or +8801712345678',
    description: 'User email address or phone number',
  })
  @IsString()
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$|^\+[1-9]\d{1,14}$/, {
    message: 'Please provide a valid email address or phone number',
  })
  identifier: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password - required for password login',
    required: false,
  })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @ApiProperty({
    example: '123456',
    description: 'Verification code - required for OTP login',
    required: false,
  })
  @IsString()
  @Matches(/^\d{6}$/, {
    message: 'Verification code must be 6 digits',
  })
  @IsOptional()
  verificationCode?: string;
}
