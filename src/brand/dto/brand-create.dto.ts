import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  Min,
  Length,
} from 'class-validator';
import { Status } from '@prisma/client';

export class CreateBrandDto {
  @ApiProperty({
    example: 'Nike',
    description: 'Brand name',
  })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({
    example: 'nike',
    description: 'Brand slug (unique)',
  })
  @IsString()
  @Length(1, 255)
  slug: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Logo image ID',
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  logoId?: number;

  @ApiPropertyOptional({
    example: 'Brand description',
    description: 'Brand description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    enum: Status,
    description: 'Brand status',
    default: Status.ACTIVE,
  })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiPropertyOptional({
    example: 0,
    description: 'Sort order',
    default: 0,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  sortOrder?: number;
}

