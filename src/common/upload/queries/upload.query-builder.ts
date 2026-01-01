import { Prisma } from '@prisma/client';
import {
  UPLOAD_DEFAULT_SELECT,
  ALLOWED_UPLOAD_FIELDS,
} from './upload.default-query';

export function buildUploadSelectQuery(fields?: string[]): Prisma.UploadSelect {
  if (!fields || fields.length === 0) {
    return UPLOAD_DEFAULT_SELECT;
  }

  const select: Prisma.UploadSelect = {};

  for (const field of fields) {
    if (field === 'uploadedBy') {
      select.uploadedBy = {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      };
    } else {
      const allowedField = field as (typeof ALLOWED_UPLOAD_FIELDS)[number];
      if (ALLOWED_UPLOAD_FIELDS.includes(allowedField)) {
        select[allowedField as keyof Prisma.UploadSelect] = true;
      }
    }
  }

  return select;
}
