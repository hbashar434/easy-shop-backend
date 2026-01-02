import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';

export class CategoryResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Electronics' })
  name: string;

  @ApiProperty({ example: 'electronics' })
  slug: string;

  @ApiProperty({ example: 1, nullable: true })
  primaryImageId: number | null;

  @ApiProperty({ example: 'Electronics category description', nullable: true })
  description: string | null;

  @ApiProperty({ example: 'Electronics - Best Deals', nullable: true })
  metaTitle: string | null;

  @ApiProperty({ example: 'Shop electronics online', nullable: true })
  metaDesc: string | null;

  @ApiProperty({ example: null, nullable: true })
  parentId: number | null;

  @ApiProperty({ example: 0 })
  depth: number;

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

