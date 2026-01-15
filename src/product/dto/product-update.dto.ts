import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  Min,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Status } from '@prisma/client';

export class UpdateProductDto {
  @ApiProperty({
    example: 'PROD-001',
    description: 'Product SKU',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(1, 255)
  sku?: string;

  @ApiProperty({
    example: 'product-slug',
    description: 'Product slug',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(1, 255)
  slug?: string;

  @ApiProperty({
    example: 'Product Name',
    description: 'Product name',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(1, 255)
  name?: string;

  @ApiProperty({
    example: 1,
    description: 'Primary image ID',
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  primaryImageId?: number;

  @ApiProperty({
    example: 'Product description',
    description: 'Product description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'Meta title',
    description: 'Meta title',
    required: false,
  })
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiProperty({
    example: 'Meta description',
    description: 'Meta description',
    required: false,
  })
  @IsString()
  @IsOptional()
  metaDesc?: string;

  @ApiProperty({
    example: 99.99,
    description: 'Product price',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @ApiProperty({
    example: 79.99,
    description: 'Discounted price',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  discountPrice?: number;

  @ApiProperty({
    example: 100,
    description: 'Stock quantity',
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  stock?: number;

  @ApiProperty({
    enum: Status,
    description: 'Product status',
    required: false,
  })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiProperty({
    example: 1,
    description: 'Brand ID',
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  brandId?: number;

  @ApiProperty({
    example: 1,
    description: 'Category ID',
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  categoryId?: number;

  @ApiProperty({
    example: { color: 'red', size: 'M' },
    description: 'Product attributes (JSON)',
    required: false,
  })
  @IsObject()
  @IsOptional()
  attributes?: Record<string, unknown>;

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

