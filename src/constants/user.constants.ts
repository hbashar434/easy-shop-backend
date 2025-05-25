import { Prisma, Status } from '@prisma/client';

// Make sure allowedFields type matches both Select and Where types
export const allowedFieldsForUser: Array<
  keyof Prisma.UserWhereInput & keyof Prisma.UserSelect
> = [
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
  'avatar',
  'addresses',
];

export const allowedRelationsForUser = ['addresses', 'avatar'];

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
  avatar: ['id', 'url', 'filePurpose', 'entityType', 'entityId'],
};

export const defaultWhereForUser: Prisma.UserWhereInput = {
  status: Status.ACTIVE,
  deletedAt: null,
};

export const defaultWhereForUniqueUser: Prisma.UserWhereUniqueInput = {
  id: '',
  email: '',
  phone: '',
};

export const defaultSelectForUser: Prisma.UserSelect = {
  id: true,
  email: true,
  phone: true,
  firstName: true,
  lastName: true,
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
  avatar: {
    select: {
      url: true,
    },
  },
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
