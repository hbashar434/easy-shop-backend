import { Prisma } from '@prisma/client';
import {
  PRODUCT_TAG_DEFAULT_SELECT,
  ALLOWED_PRODUCT_TAG_FIELDS,
} from './product-tag.default-query';

export function buildProductTagSelectQuery(
  fields?: string[],
): Prisma.ProductTagSelect {
  if (!fields || fields.length === 0) {
    return PRODUCT_TAG_DEFAULT_SELECT;
  }

  const select: Prisma.ProductTagSelect = {};

  for (const field of fields) {
    if (field === 'product') {
      select.product = {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      };
    } else {
      const allowedField = field as (typeof ALLOWED_PRODUCT_TAG_FIELDS)[number];
      if (ALLOWED_PRODUCT_TAG_FIELDS.includes(allowedField)) {
        select[allowedField as keyof Prisma.ProductTagSelect] = true;
      }
    }
  }

  return select;
}

