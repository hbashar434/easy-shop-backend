import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'b3f14b1e-2a6b-4e23-bd17-8c5f60a3d9f7',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
  })
  firstName: string | null;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  lastName: string | null;

  @ApiProperty({
    description: 'User role',
    example: 'USER',
    enum: Role,
  })
  role: Role;

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2024-04-03T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User last update timestamp',
    example: '2024-04-03T12:00:00Z',
  })
  updatedAt: Date;
}

export class UserListResponseDto {
  @ApiProperty({
    type: [UserResponseDto],
    description: 'List of users',
  })
  users: UserResponseDto[];
}

export class DeleteUserResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'User deleted successfully',
  })
  message: string;
}
