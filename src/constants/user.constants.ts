import { Prisma, Status } from '@prisma/client';

export const allowedFieldsForUser: (keyof Prisma.UserWhereInput)[] = [
  'id',
  'email',
  'phone',
  'firstName',
  'lastName',
  'role',
  'status',
  'isProfileComplete',
  'isEmailVerified',
  'isPhoneVerified',
  'lastLogin',
  'createdAt',
  'updatedAt',
  'deletedAt',
];

export const allowedRelationsForUser = ['addresses'];

export const allowedRelationFieldsForUser: Record<string, string[]> = {
  addresses: [
    'id',
    'street',
    'city',
    'state',
    'postalCode',
    'country',
    'isDefault',
  ],
};

export const defaultWhereForUser: Prisma.UserWhereInput = {
  status: Status.ACTIVE,
  deletedAt: null,
};

export const defaultSelectForUser: Prisma.UserSelect = {
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
};

export const defaultIncludeForUser: Prisma.UserInclude = {
  addresses: {
    where: {
      isDefault: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      street: true,
      city: true,
      state: true,
    },
  },
};
