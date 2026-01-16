import { Prisma } from '@prisma/client';
import {
  ADDRESS_DEFAULT_SELECT,
  ALLOWED_ADDRESS_FIELDS,
} from './address.default-query';

export function buildAddressSelectQuery(
  fields?: string[],
): Prisma.AddressSelect {
  if (!fields || fields.length === 0) {
    return ADDRESS_DEFAULT_SELECT;
  }

  const select: Prisma.AddressSelect = {};

  for (const field of fields) {
    if (field === 'user') {
      select.user = {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      };
    } else {
      const allowedField = field as (typeof ALLOWED_ADDRESS_FIELDS)[number];
      if (ALLOWED_ADDRESS_FIELDS.includes(allowedField)) {
        select[allowedField as keyof Prisma.AddressSelect] = true;
      }
    }
  }

  return select;
}
