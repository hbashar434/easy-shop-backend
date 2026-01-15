import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';

export class ProductResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'PROD-001', nullable: true })
  sku: string | null;

  @ApiProperty({ example: 'product-slug' })
  slug: string;

  @ApiProperty({ example: 'Product Name' })
  name: string;

  @ApiProperty({ example: 1, nullable: true })
  primaryImageId: number | null;

  @ApiProperty({ example: 'Product description', nullable: true })
  description: string | null;

  @ApiProperty({ example: 'Meta title', nullable: true })
  metaTitle: string | null;

  @ApiProperty({ example: 'Meta description', nullable: true })
  metaDesc: string | null;

  @ApiProperty({ example: 99.99 })
  price: number;

  @ApiProperty({ example: 79.99, nullable: true })
  discountPrice: number | null;

  @ApiProperty({ example: 100 })
  stock: number;

  @ApiProperty({ enum: Status, example: Status.ACTIVE })
  status: Status;

  @ApiProperty({ example: 1, nullable: true })
  brandId: number | null;

  @ApiProperty({ example: 1 })
  categoryId: number;

  @ApiProperty({ example: { color: 'red', size: 'M' }, nullable: true })
  attributes: Record<string, unknown> | null;

  @ApiProperty({ example: 0 })
  sortOrder: number;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  updatedAt: Date;

  @ApiProperty({ example: null, nullable: true })
  deletedAt: Date | null;
}

