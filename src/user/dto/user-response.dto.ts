import { ApiProperty } from '@nestjs/swagger';
import { Role, Status } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: 'user@example.com', nullable: true })
  email: string | null;

  @ApiProperty({ example: '+8801712345678', nullable: true })
  phone: string | null;

  @ApiProperty({ example: 'John', nullable: true })
  firstName: string | null;

  @ApiProperty({ example: 'Doe', nullable: true })
  lastName: string | null;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', nullable: true })
  avatar: string | null;

  @ApiProperty({ enum: Role, example: Role.USER })
  role: Role;

  @ApiProperty({ enum: Status, example: Status.ACTIVE })
  status: Status;

  @ApiProperty({ example: false })
  isProfileComplete: boolean;

  @ApiProperty({ example: false })
  isEmailVerified: boolean;

  @ApiProperty({ example: false })
  isPhoneVerified: boolean;

  @ApiProperty({ example: null, nullable: true })
  verificationToken: string | null;

  @ApiProperty({ example: null, nullable: true })
  verificationExpires: Date | null;

  @ApiProperty({ example: null, nullable: true })
  refreshToken: string | null;

  @ApiProperty({ example: '2025-01-01T00:00:00Z', nullable: true })
  lastLogin: Date | null;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  updatedAt: Date;

  @ApiProperty({ example: null, nullable: true })
  deletedAt: Date | null;
}
