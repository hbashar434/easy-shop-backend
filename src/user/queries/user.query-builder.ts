import { Prisma } from '@prisma/client';
import { USER_DEFAULT_SELECT, ALLOWED_USER_FIELDS } from './user.default-query';

export type UserQueryFields = (typeof ALLOWED_USER_FIELDS)[number][];

export function buildUserSelectQuery(fields?: string[]): Prisma.UserSelect {
  if (!fields || fields.length === 0) {
    return USER_DEFAULT_SELECT;
  }

  const select: Prisma.UserSelect = {};

  for (const field of fields) {
    if (field === 'avatar') {
      select.avatar = {
        select: {
          id: true,
          url: true,
          fileName: true,
          fileType: true,
          alt: true,
          filePurpose: true,
          createdAt: true,
        },
      };
    } else {
      const allowedField = field as (typeof ALLOWED_USER_FIELDS)[number];
      if (ALLOWED_USER_FIELDS.includes(allowedField)) {
        select[allowedField as keyof Prisma.UserSelect] = true;
      }
    }
  }

  return select;
}
