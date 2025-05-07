import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  Length,
} from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserDto {
  @ApiProperty({
    example: 'John',
    description: 'User first name',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  lastName?: string;

  @ApiProperty({
    enum: Role,
    description: 'User role',
    required: false,
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiProperty({
    example: true,
    description: 'User active status',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UserFiltersDto {
  @ApiProperty({
    description: 'Search by name or email or phone',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    enum: Role,
    description: 'Filter by role',
    required: false,
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiProperty({
    example: true,
    description: 'Filter by active status',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: true,
    description: 'Filter by email verification status',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean;

  @ApiProperty({
    example: true,
    description: 'Filter by phone verification status',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPhoneVerified?: boolean;

  @ApiProperty({
    example: true,
    description: 'Filter by profile completion status',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isProfileComplete?: boolean;

  @ApiProperty({
    example: '2025-01-01',
    description: 'Filter by start date',
    required: false,
  })
  @IsOptional()
  startDate?: Date;

  @ApiProperty({
    example: '2025-12-31',
    description: 'Filter by end date',
    required: false,
  })
  @IsOptional()
  endDate?: Date;
}
