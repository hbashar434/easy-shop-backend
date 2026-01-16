import { ApiProperty } from '@nestjs/swagger';

export class AddressResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'user-uuid' })
  userId: string;

  @ApiProperty({ example: '123 Main Street' })
  street: string;

  @ApiProperty({ example: 'New York' })
  city: string;

  @ApiProperty({ example: 'NY', nullable: true })
  state: string | null;

  @ApiProperty({ example: '10001', nullable: true })
  postalCode: string | null;

  @ApiProperty({ example: 'United States' })
  country: string;

  @ApiProperty({ example: false })
  isDefault: boolean;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  updatedAt: Date;

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
