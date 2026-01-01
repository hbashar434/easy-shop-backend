import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { FilePurpose, EntityType, Status } from '@prisma/client';
import { ALLOWED_UPLOAD_FIELDS } from '../queries/upload.default-query';

export class UploadQueryDto {
  @ApiPropertyOptional({
    description:
      'Comma-separated list of field names to include in the response',
    example: ALLOWED_UPLOAD_FIELDS.join(','),
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
    description: 'Filter by file purpose',
    enum: FilePurpose,
    example: FilePurpose.PRODUCT_IMAGE,
  })
  @IsOptional()
  @IsEnum(FilePurpose)
  filePurpose?: FilePurpose;

  @ApiPropertyOptional({
    description: 'Filter by entity type',
    enum: EntityType,
    example: EntityType.PRODUCT,
  })
  @IsOptional()
  @IsEnum(EntityType)
  entityType?: EntityType;

  @ApiPropertyOptional({
    description: 'Filter by entity ID',
    example: '123',
    type: String,
  })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: Status,
    example: Status.ACTIVE,
  })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
