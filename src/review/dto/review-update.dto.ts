import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Status } from '@prisma/client';

export class UpdateReviewDto {
  @ApiPropertyOptional({
    example: 5,
    description: 'Review rating (1-5)',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    example: 'Great product, highly recommended!',
    description: 'Review comment',
  })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiPropertyOptional({
    enum: Status,
    description: 'Review status',
  })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiPropertyOptional({
    example: 0,
    description: 'Sort order',
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  sortOrder?: number;
}
