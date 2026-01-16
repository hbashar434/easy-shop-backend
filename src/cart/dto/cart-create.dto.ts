import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class CreateCartItemDto {
  @ApiProperty({
    example: 1,
    description: 'Product ID',
  })
  @IsInt()
  @Min(1)
  productId: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Quantity of the product',
    default: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  quantity?: number;
}
