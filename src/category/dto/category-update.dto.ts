import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max, Length } from 'class-validator';
import { Status } from '@prisma/client';

export class UpdateCategoryDto {
  @ApiProperty({
    example: 'Electronics',
    description: 'Category name',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(1, 255)
  name?: string;

  @ApiProperty({
    example: 'electronics',
    description: 'Category slug',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(1, 255)
  slug?: string;

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
    example: 'Category description',
    description: 'Category description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'Meta title for SEO',
    description: 'Meta title',
    required: false,
  })
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiProperty({
    example: 'Meta description for SEO',
    description: 'Meta description',
    required: false,
  })
  @IsString()
  @IsOptional()
  metaDesc?: string;

  @ApiProperty({
    example: null,
    description: 'Parent category ID',
    required: false,
  })
  @IsInt()
  @IsOptional()
  parentId?: number | null;

  @ApiProperty({
    enum: Status,
    description: 'Category status',
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

