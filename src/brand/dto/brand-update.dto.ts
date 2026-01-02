import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  Length,
} from 'class-validator';
import { Status } from '@prisma/client';

export class UpdateBrandDto {
  @ApiProperty({
    example: 'Nike',
    description: 'Brand name',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(1, 255)
  name?: string;

  @ApiProperty({
    example: 'nike',
    description: 'Brand slug',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(1, 255)
  slug?: string;

  @ApiProperty({
    example: 1,
    description: 'Logo image ID',
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  logoId?: number;

  @ApiProperty({
    example: 'Brand description',
    description: 'Brand description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    enum: Status,
    description: 'Brand status',
    required: false,
  })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiProperty({
    example: 0,
    description: 'Sort order',
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  sortOrder?: number;
}

