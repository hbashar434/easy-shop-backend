import { Prisma } from '@prisma/client';
import {
  REVIEW_DEFAULT_SELECT,
  ALLOWED_REVIEW_FIELDS,
} from './review.default-query';

export function buildReviewSelectQuery(fields?: string[]): Prisma.ReviewSelect {
  if (!fields || fields.length === 0) {
    return REVIEW_DEFAULT_SELECT;
  }

  const select: Prisma.ReviewSelect = {};

  for (const field of fields) {
    if (field === 'user') {
      select.user = {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      };
    } else if (field === 'product') {
      select.product = {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      };
    } else if (field === 'images') {
      select.images = {
        select: {
          id: true,
          url: true,
          alt: true,
        },
      };
    } else {
      const allowedField = field as (typeof ALLOWED_REVIEW_FIELDS)[number];
      if (ALLOWED_REVIEW_FIELDS.includes(allowedField)) {
        select[allowedField as keyof Prisma.ReviewSelect] = true;
      }
    }
  }

  return select;
}
