import { Prisma, Status } from '@prisma/client';

export const allowedFields: (keyof Prisma.UserWhereInput)[] = [
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
];

export const allowedRelations = ['addresses'];

export const allowedRelationFields: Record<string, string[]> = {
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

export const defaultWhere: Prisma.UserWhereInput = {
  status: Status.ACTIVE,
  deletedAt: null,
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
};

export const defaultInclude: Prisma.UserInclude = {
  addresses: {
    where: {
      isDefault: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      street: true,
      city: true,
      state: true,
      postalCode: true,
      country: true,
      isDefault: true,
    },
    take: 1,
  },
};
