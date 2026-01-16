import { Prisma } from '@prisma/client';

export const ADDRESS_DEFAULT_SELECT: Prisma.AddressSelect = {
  id: true,
  userId: true,
  street: true,
  city: true,
  state: true,
  postalCode: true,
  country: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
};

export const ALLOWED_ADDRESS_FIELDS = [
  'id',
  'userId',
  'street',
  'city',
  'state',
  'postalCode',
  'country',
  'isDefault',
  'createdAt',
  'updatedAt',
  'user',
];
