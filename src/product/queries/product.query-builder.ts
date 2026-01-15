import { Prisma } from '@prisma/client';
import { PRODUCT_DEFAULT_SELECT, ALLOWED_PRODUCT_FIELDS } from './product.default-query';

export function buildProductSelectQuery(fields?: string[]): Prisma.ProductSelect {
  if (!fields || fields.length === 0) {
    return PRODUCT_DEFAULT_SELECT;
  }

  const select: Prisma.ProductSelect = {};

  for (const field of fields) {
    if (field === 'primaryImage') {
      select.primaryImage = {
        select: {
          id: true,
          url: true,
          alt: true,
        },
      };
    } else if (field === 'brand') {
      select.brand = {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      };
    } else if (field === 'category') {
      select.category = {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      };
    } else {
      const allowedField = field as (typeof ALLOWED_PRODUCT_FIELDS)[number];
      if (ALLOWED_PRODUCT_FIELDS.includes(allowedField)) {
        select[allowedField as keyof Prisma.ProductSelect] = true;
      }
    }
  }

  return select;
}

