import { Prisma } from '@prisma/client';

export const USER_DEFAULT_SELECT: Prisma.UserSelect = {
  id: true,
  email: true,
  phone: true,
  firstName: true,
  lastName: true,
  avatarId: true,
  role: true,
  status: true,
  isProfileComplete: true,
  isEmailVerified: true,
  isPhoneVerified: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  avatar: {
    select: {
      url: true,
      alt: true,
    },
  },
};

export const ALLOWED_USER_FIELDS = [
  'id',
  'email',
  'phone',
  'firstName',
  'lastName',
  'avatarId',
  'role',
  'status',
  'isProfileComplete',
  'isEmailVerified',
  'isPhoneVerified',
  'lastLogin',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'avatar',
] as const;
