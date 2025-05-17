import { Prisma, Status } from '@prisma/client';

// Fields that can be used in where clauses (for filtering)
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

// Fields that can be returned for each relation
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

// Default fields to return for users including relations
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
  // addresses: {
  //   select: {
  //     id: true,
  //     street: true,
  //     city: true,
  //     state: true,
  //     postalCode: true,
  //     country: true,
  //     isDefault: true,
  //   },
  // },
};

// This can be empty since we're handling everything in defaultSelect
export const defaultInclude: Prisma.UserInclude = {};
