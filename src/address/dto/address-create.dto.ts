import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({
    example: '123 Main Street',
    description: 'Street address',
  })
  @IsString()
  street: string;

  @ApiProperty({
    example: 'New York',
    description: 'City name',
  })
  @IsString()
  city: string;

  @ApiPropertyOptional({
    example: 'NY',
    description: 'State/Province',
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({
    example: '10001',
    description: 'Postal/Zip code',
  })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiProperty({
    example: 'United States',
    description: 'Country name',
  })
  @IsString()
  country: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether this is default address',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
