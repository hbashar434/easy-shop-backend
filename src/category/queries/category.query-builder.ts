import { Prisma } from '@prisma/client';
import {
  CATEGORY_DEFAULT_SELECT,
  ALLOWED_CATEGORY_FIELDS,
} from './category.default-query';

export function buildCategorySelectQuery(
  fields?: string[],
): Prisma.CategorySelect {
  if (!fields || fields.length === 0) {
    return CATEGORY_DEFAULT_SELECT;
  }

  const select: Prisma.CategorySelect = {};

  for (const field of fields) {
    if (field === 'primaryImage') {
      select.primaryImage = {
        select: {
          id: true,
          url: true,
          alt: true,
        },
      };
    } else if (field === 'parent') {
      select.parent = {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      };
    } else {
      const allowedField = field as (typeof ALLOWED_CATEGORY_FIELDS)[number];
      if (ALLOWED_CATEGORY_FIELDS.includes(allowedField)) {
        select[allowedField as keyof Prisma.CategorySelect] = true;
      }
    }
  }

  return select;
}

