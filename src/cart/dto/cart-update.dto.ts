import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiPropertyOptional({
    example: 2,
    description: 'Quantity of the product',
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  quantity?: number;
}
