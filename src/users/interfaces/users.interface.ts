import { Role } from '@prisma/client';

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  role?: Role;
  isActive?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: Role;
  isActive?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isProfileComplete?: boolean;
  startDate?: Date;
  endDate?: Date;
  requesterRole?: Role;
}
