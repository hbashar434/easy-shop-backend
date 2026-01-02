import { Prisma } from '@prisma/client';

export const CATEGORY_DEFAULT_SELECT: Prisma.CategorySelect = {
  id: true,
  name: true,
  slug: true,
  primaryImageId: true,
  description: true,
  metaTitle: true,
  metaDesc: true,
  parentId: true,
  depth: true,
  status: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  primaryImage: {
    select: {
      id: true,
      url: true,
      alt: true,
    },
  },
  parent: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
};

export const ALLOWED_CATEGORY_FIELDS = [
  'id',
  'name',
  'slug',
  'primaryImageId',
  'description',
  'metaTitle',
  'metaDesc',
  'parentId',
  'depth',
  'status',
  'sortOrder',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'primaryImage',
  'parent',
] as const;

