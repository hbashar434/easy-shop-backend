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

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Electronics',
    description: 'Category name',
  })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({
    example: 'electronics',
    description: 'Category slug (unique)',
  })
  @IsString()
  @Length(1, 255)
  slug: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Primary image ID',
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  primaryImageId?: number;

  @ApiPropertyOptional({
    example: 'Electronics category description',
    description: 'Category description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'Electronics - Best Deals',
    description: 'Meta title for SEO',
  })
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiPropertyOptional({
    example: 'Shop electronics online',
    description: 'Meta description for SEO',
  })
  @IsString()
  @IsOptional()
  metaDesc?: string;

  @ApiPropertyOptional({
    example: null,
    description: 'Parent category ID (null for root category)',
  })
  @IsInt()
  @IsOptional()
  parentId?: number | null;

  @ApiPropertyOptional({
    enum: Status,
    description: 'Category status',
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
