import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';

export class BrandResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Nike' })
  name: string;

  @ApiProperty({ example: 'nike' })
  slug: string;

  @ApiProperty({ example: 1, nullable: true })
  logoId: number | null;

  @ApiProperty({ example: 'Brand description', nullable: true })
  description: string | null;

  @ApiProperty({ enum: Status, example: Status.ACTIVE })
  status: Status;

  @ApiProperty({ example: 0 })
  sortOrder: number;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  updatedAt: Date;

  @ApiProperty({ example: null, nullable: true })
  deletedAt: Date | null;
}

