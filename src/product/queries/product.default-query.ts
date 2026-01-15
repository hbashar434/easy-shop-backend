import { Prisma } from '@prisma/client';

export const PRODUCT_DEFAULT_SELECT: Prisma.ProductSelect = {
  id: true,
  sku: true,
  slug: true,
  name: true,
  primaryImageId: true,
  description: true,
  metaTitle: true,
  metaDesc: true,
  price: true,
  discountPrice: true,
  stock: true,
  status: true,
  brandId: true,
  categoryId: true,
  attributes: true,
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
  brand: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
};

export const ALLOWED_PRODUCT_FIELDS = [
  'id',
  'sku',
  'slug',
  'name',
  'primaryImageId',
  'description',
  'metaTitle',
  'metaDesc',
  'price',
  'discountPrice',
  'stock',
  'status',
  'brandId',
  'categoryId',
  'attributes',
  'sortOrder',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'primaryImage',
  'brand',
  'category',
] as const;

