import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, IsOptional } from 'class-validator';

export class RequestEmailVerificationDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address to verify',
  })
  @IsEmail()
  email: string;
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
