import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';

export class ReviewResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 5 })
  rating: number;

  @ApiProperty({
    example: 'Great product, highly recommended!',
    nullable: true,
  })
  comment: string | null;

  @ApiProperty({ example: 'user-uuid' })
  userId: string;

  @ApiProperty({ example: 1 })
  productId: number;

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

  @ApiProperty({
    example: { id: 'user-uuid', firstName: 'John', lastName: 'Doe' },
    nullable: true,
  })
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };

  @ApiProperty({
    example: { id: 1, name: 'Product Name', slug: 'product-name' },
    nullable: true,
  })
  product?: {
    id: number;
    name: string;
    slug: string;
  };

  @ApiProperty({ example: [], nullable: true })
  images?: Array<{
    id: number;
    url: string;
    alt: string | null;
  }>;
}
