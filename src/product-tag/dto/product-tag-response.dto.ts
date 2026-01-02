import { ApiProperty } from '@nestjs/swagger';

export class ProductTagResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'New Arrival' })
  name: string;

  @ApiProperty({ example: 1 })
  productId: number;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  updatedAt: Date;
}

