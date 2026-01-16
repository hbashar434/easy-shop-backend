import { Prisma } from '@prisma/client';
import { CART_DEFAULT_SELECT, ALLOWED_CART_FIELDS } from './cart.default-query';

export function buildCartSelectQuery(fields?: string[]): Prisma.CartItemSelect {
  if (!fields || fields.length === 0) {
    return CART_DEFAULT_SELECT;
  }

  const select: Prisma.CartItemSelect = {};

  for (const field of fields) {
    if (field === 'product') {
      select.product = {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          stock: true,
        },
      };
    } else if (field === 'user') {
      select.user = {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      };
    } else {
      const allowedField = field as (typeof ALLOWED_CART_FIELDS)[number];
      if (ALLOWED_CART_FIELDS.includes(allowedField)) {
        select[allowedField as keyof Prisma.CartItemSelect] = true;
      }
    }
  }

  return select;
}
