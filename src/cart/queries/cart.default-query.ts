import { Prisma } from '@prisma/client';

export const CART_DEFAULT_SELECT: Prisma.CartItemSelect = {
  id: true,
  userId: true,
  productId: true,
  quantity: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      stock: true,
    },
  },
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
};

export const ALLOWED_CART_FIELDS = [
  'id',
  'userId',
  'productId',
  'quantity',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'product',
  'user',
];
