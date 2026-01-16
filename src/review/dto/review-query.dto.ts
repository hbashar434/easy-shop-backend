import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { Status } from '@prisma/client';
import { ALLOWED_REVIEW_FIELDS } from '../queries/review.default-query';

export class ReviewQueryDto {
  @ApiPropertyOptional({
    description:
      'Comma-separated list of field names to include in the response',
    example: ALLOWED_REVIEW_FIELDS.join(','),
    type: String,
  })
  @IsOptional()
  @IsString()
  fields?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    type: Number,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    type: Number,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: Status,
    example: Status.ACTIVE,
  })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiPropertyOptional({
    description: 'Filter by product ID',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId?: number;

  @ApiPropertyOptional({
    description: 'Filter by user ID',
    example: 'user-uuid',
    type: String,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter by rating (1-5)',
    example: 5,
    type: Number,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Search by comment',
    example: 'great product',
    type: String,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
