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
    required: false,
  })
  email: string | null;

  @ApiProperty({
    description: 'Phone number',
    example: '+8801712345678',
    required: false,
  })
  phone: string | null;

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
    description: 'Account active status',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Email verification status',
    example: false,
  })
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'Phone verification status',
    example: false,
  })
  isPhoneVerified: boolean;

  @ApiProperty({
    description: 'Last login timestamp',
    example: '2024-04-03T12:00:00Z',
    required: false,
  })
  lastLogin: Date | null;

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

  @ApiProperty({
    description: 'User deletion timestamp',
    example: '2024-04-03T12:00:00Z',
    required: false,
  })
  deletedAt: Date | null;
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
