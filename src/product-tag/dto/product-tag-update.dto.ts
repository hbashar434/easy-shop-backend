import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Length, Min } from 'class-validator';

export class UpdateProductTagDto {
  @ApiProperty({
    example: 'New Arrival',
    description: 'Tag name',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(1, 255)
  name?: string;

  @ApiProperty({
    example: 1,
    description: 'Product ID',
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  productId?: number;
}

