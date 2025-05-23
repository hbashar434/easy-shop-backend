import { Role, Status } from '@prisma/client';

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  role?: Role;
  status?: Status;
}

export interface UserFilters {
  search?: string;
  role?: Role;
  status?: Status;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isProfileComplete?: boolean;
  startDate?: Date;
  endDate?: Date;
  requesterRole?: Role;
}
