import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Length,
  MinLength,
  IsOptional,
} from 'class-validator';

export class RequestPasswordResetDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: '+8801712345678',
    description: 'Phone number',
  })
  @IsString()
  @IsOptional()
  phone?: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: '+8801712345678',
    description: 'Phone number',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: '123456',
    description: 'Reset password code (6 digits)',
  })
  @IsString()
  @Length(6, 6)
  code: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'New password - minimum 8 characters',
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
