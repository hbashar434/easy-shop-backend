import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'User information',
    example: {
      id: 'b3f14b1e-2a6b-4e23-bd17-8c5f60a3d9f7',
      email: 'user@example.com',
      phone: '+1234567890',
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
      isEmailVerified: true,
      isPhoneVerified: false,
      isProfileComplete: false,
      isActive: true,
      lastLogin: '2024-03-20T12:00:00Z',
      createdAt: '2024-03-20T12:00:00Z',
      updatedAt: '2024-03-20T12:00:00Z',
    },
  })
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    firstName: string | null;
    lastName: string | null;
    role: Role;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    isProfileComplete: boolean;
    isActive: boolean;
    lastLogin: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
}
