import { ApiProperty } from '@nestjs/swagger';
import { Role, Status } from '@prisma/client';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User information',
    example: {
      id: 'b3f14b1e-2a6b-4e23-bd17-8c5f60a3d9f7',
      email: 'user@example.com',
      phone: '+1234567890',
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
      status: 'ACTIVE',
      isEmailVerified: true,
      isPhoneVerified: false,
      isProfileComplete: false,
      lastLogin: '2024-03-20T12:00:00Z',
      createdAt: '2024-03-20T12:00:00Z',
      updatedAt: '2024-03-20T12:00:00Z',
      deletedAt: null,
    },
  })
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    firstName: string | null;
    lastName: string | null;
    role: Role;
    status: Status;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    isProfileComplete: boolean;
    lastLogin: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  };
}
