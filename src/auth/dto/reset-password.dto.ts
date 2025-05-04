import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, MinLength, Matches } from 'class-validator';

export class RequestEmailPasswordResetDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address to send reset code to',
  })
  @IsEmail()
  email: string;
}

export class ResetEmailPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address',
  })
  @IsEmail()
  email: string;

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

export class RequestPhonePasswordResetDto {
  @ApiProperty({
    example: '+8801712345678',
    description: 'Phone number to send reset code to',
  })
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message:
      'Phone number must be in international format (e.g., +8801712345678)',
  })
  phone: string;
}

export class ResetPhonePasswordDto {
  @ApiProperty({
    example: '+8801712345678',
    description: 'Phone number',
  })
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message:
      'Phone number must be in international format (e.g., +8801712345678)',
  })
  phone: string;

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
