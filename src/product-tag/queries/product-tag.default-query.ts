import { Prisma } from '@prisma/client';

export const PRODUCT_TAG_DEFAULT_SELECT: Prisma.ProductTagSelect = {
  id: true,
  name: true,
  productId: true,
  createdAt: true,
  updatedAt: true,
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
};

export const ALLOWED_PRODUCT_TAG_FIELDS = [
  'id',
  'name',
  'productId',
  'createdAt',
  'updatedAt',
  'product',
] as const;

