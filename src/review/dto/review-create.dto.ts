import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsEnum, Min, Max } from 'class-validator';
import { Status } from '@prisma/client';

export class CreateReviewDto {
  @ApiProperty({
    example: 5,
    description: 'Review rating (1-5)',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    example: 'Great product, highly recommended!',
    description: 'Review comment',
  })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({
    example: 1,
    description: 'Product ID',
  })
  @IsInt()
  @Min(1)
  productId: number;

  @ApiPropertyOptional({
    enum: Status,
    description: 'Review status',
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
