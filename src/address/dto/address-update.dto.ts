import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateAddressDto {
  @ApiPropertyOptional({
    example: '123 Main Street',
    description: 'Street address',
  })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiPropertyOptional({
    example: 'New York',
    description: 'City name',
  })
  @IsString()
  @IsOptional()
  city?: string;

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

  @ApiPropertyOptional({
    example: 'United States',
    description: 'Country name',
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether this is default address',
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
