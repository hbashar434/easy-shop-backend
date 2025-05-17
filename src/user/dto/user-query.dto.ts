import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  Length,
  IsUrl,
  IsObject,
  IsNumber,
} from 'class-validator';
import { Prisma, Role, Status } from '@prisma/client';
import { Type } from 'class-transformer';

export class UserQueryDto {
  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  where?: Prisma.UserWhereInput;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  select?: Prisma.UserSelect;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  include?: Prisma.UserInclude;

  @ApiPropertyOptional({ type: Object, example: { createdAt: 'desc' } })
  @IsOptional()
  @IsObject()
  orderBy?: Prisma.UserOrderByWithRelationInput;

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
