import { ApiProperty } from '@nestjs/swagger';

export class CartItemResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'user-uuid' })
  userId: string;

  @ApiProperty({ example: 1 })
  productId: number;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  updatedAt: Date;

  @ApiProperty({ example: null, nullable: true })
  deletedAt: Date | null;

  @ApiProperty({
    example: {
      id: 1,
      name: 'Product Name',
      slug: 'product-name',
      price: '99.99',
      stock: 10,
    },
    nullable: true,
  })
  product?: {
    id: number;
    name: string;
    slug: string;
    price: string;
    stock: number;
  };

  @ApiProperty({
    example: {
      id: 'user-uuid',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
    nullable: true,
  })
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
}
