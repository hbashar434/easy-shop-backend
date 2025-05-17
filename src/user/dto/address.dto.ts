import { ApiProperty } from '@nestjs/swagger';

export class AddressDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '123 Main Street' })
  street: string;

  @ApiProperty({ example: 'New York' })
  city: string;

  @ApiProperty({ example: 'NY', nullable: true })
  state: string | null;

  @ApiProperty({ example: '10001', nullable: true })
  postalCode: string | null;

  @ApiProperty({ example: 'USA' })
  country: string;

  @ApiProperty({ example: true })
  isDefault: boolean;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  updatedAt: Date;
}
