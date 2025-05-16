import { Prisma, Status } from '@prisma/client';

export const allowedFields: (keyof Prisma.UserWhereInput)[] = [
  'id',
  'email',
  'phone',
  'firstName',
  'lastName',
  'avatar',
  'role',
  'status',
  'isProfileComplete',
  'isEmailVerified',
  'isPhoneVerified',
  'lastLogin',
  'createdAt',
  'updatedAt',
];
export const allowedRelations = ['addresses'];

export const defaultWhere: Prisma.UserWhereInput = {
  status: Status.ACTIVE,
  deletedAt: null,
};

export const defaultInclude: Prisma.UserInclude = {
  addresses: true,
};

export const defaultSelect: Prisma.UserSelect = {
  id: true,
  email: true,
  phone: true,
  firstName: true,
  lastName: true,
  avatar: true,
  role: true,
  status: true,
  isProfileComplete: true,
  isEmailVerified: true,
  isPhoneVerified: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true,
  addresses: {
    select: {
      id: true,
      userId: true,
      street: true,
      city: true,
      state: true,
      country: true,
      postalCode: true,
      isDefault: true,
    },
  },
};
