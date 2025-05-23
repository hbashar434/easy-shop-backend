import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, Length, IsUrl } from 'class-validator';
import { Role, Status } from '@prisma/client';

export class UpdateUserDto {
  @ApiProperty({
    example: 'John',
    description: 'User first name',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  lastName?: string;

  @ApiProperty({
    enum: Role,
    example: Role.USER,
    required: false,
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiProperty({
    enum: Status,
    description: 'User status',
    required: false,
  })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}
