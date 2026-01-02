import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Length, Min } from 'class-validator';

export class CreateProductTagDto {
  @ApiProperty({
    example: 'New Arrival',
    description: 'Tag name (must be unique)',
  })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({
    example: 1,
    description: 'Product ID',
  })
  @IsInt()
  @Min(1)
  productId: number;
}

