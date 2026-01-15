import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsNumber,
  IsObject,
  Min,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Status } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty({
    example: 'PROD-001',
    description: 'Product SKU (unique)',
  })
  @IsString()
  @IsOptional()
  @Length(1, 255)
  sku?: string;

  @ApiProperty({
    example: 'product-slug',
    description: 'Product slug (unique)',
  })
  @IsString()
  @Length(1, 255)
  slug: string;

  @ApiProperty({
    example: 'Product Name',
    description: 'Product name',
  })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Primary image ID',
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  primaryImageId?: number;

  @ApiPropertyOptional({
    example: 'Product description',
    description: 'Product description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'Meta title for SEO',
    description: 'Meta title',
  })
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiPropertyOptional({
    example: 'Meta description for SEO',
    description: 'Meta description',
  })
  @IsString()
  @IsOptional()
  metaDesc?: string;

  @ApiProperty({
    example: 99.99,
    description: 'Product price',
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({
    example: 79.99,
    description: 'Discounted price',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  discountPrice?: number;

  @ApiPropertyOptional({
    example: 100,
    description: 'Stock quantity',
    default: 0,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({
    enum: Status,
    description: 'Product status',
    default: Status.ACTIVE,
  })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiPropertyOptional({
    example: 1,
    description: 'Brand ID',
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  brandId?: number;

  @ApiProperty({
    example: 1,
    description: 'Category ID (required)',
  })
  @IsInt()
  @Min(1)
  categoryId: number;

  @ApiPropertyOptional({
    example: { color: 'red', size: 'M' },
    description: 'Product attributes (JSON)',
  })
  @IsObject()
  @IsOptional()
  attributes?: Record<string, unknown>;

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

