import { Prisma } from '@prisma/client';

export const BRAND_DEFAULT_SELECT: Prisma.BrandSelect = {
  id: true,
  name: true,
  slug: true,
  logoId: true,
  description: true,
  status: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  logo: {
    select: {
      id: true,
      url: true,
      alt: true,
    },
  },
};

export const ALLOWED_BRAND_FIELDS = [
  'id',
  'name',
  'slug',
  'logoId',
  'description',
  'status',
  'sortOrder',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'logo',
] as const;

