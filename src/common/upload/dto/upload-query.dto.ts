import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsObject, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { Prisma } from '@prisma/client';

export class UploadQueryDto {
  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  where?: Prisma.UploadWhereInput;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  select?: Prisma.UploadSelect;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  include?: Prisma.UploadInclude;

  @ApiPropertyOptional({ type: Object, example: { createdAt: 'desc' } })
  @IsOptional()
  @IsObject()
  orderBy?: Prisma.UploadOrderByWithRelationInput;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  take?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  skip?: number;
}
