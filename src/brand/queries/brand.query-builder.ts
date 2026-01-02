import { Prisma } from '@prisma/client';
import { BRAND_DEFAULT_SELECT, ALLOWED_BRAND_FIELDS } from './brand.default-query';

export function buildBrandSelectQuery(fields?: string[]): Prisma.BrandSelect {
  if (!fields || fields.length === 0) {
    return BRAND_DEFAULT_SELECT;
  }

  const select: Prisma.BrandSelect = {};

  for (const field of fields) {
    if (field === 'logo') {
      select.logo = {
        select: {
          id: true,
          url: true,
          alt: true,
        },
      };
    } else {
      const allowedField = field as (typeof ALLOWED_BRAND_FIELDS)[number];
      if (ALLOWED_BRAND_FIELDS.includes(allowedField)) {
        select[allowedField as keyof Prisma.BrandSelect] = true;
      }
    }
  }

  return select;
}

