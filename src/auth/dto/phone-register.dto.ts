import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional, Matches } from 'class-validator';
import { Role } from '@prisma/client';

export class PhoneRegisterDto {
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
    description: 'User password - minimum 8 characters',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @IsOptional()
  role?: Role;
}
