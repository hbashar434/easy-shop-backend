import { Prisma } from '@prisma/client';

export const REVIEW_DEFAULT_SELECT: Prisma.ReviewSelect = {
  id: true,
  rating: true,
  comment: true,
  userId: true,
  productId: true,
  status: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  images: {
    select: {
      id: true,
      url: true,
      alt: true,
    },
  },
};

export const ALLOWED_REVIEW_FIELDS = [
  'id',
  'rating',
  'comment',
  'userId',
  'productId',
  'status',
  'sortOrder',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'user',
  'product',
  'images',
];
