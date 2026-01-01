import { BadRequestException } from '@nestjs/common';

export function sanitizeQuery(
  fields: unknown,
  allowedFields: readonly string[],
): string[] {
  if (!fields) {
    return [];
  }

  let stringFields: string[] = [];
  if (typeof fields === 'string') {
    stringFields = fields
      .split(',')
      .map((field) => field.trim())
      .filter((field) => field.length > 0);
  } else if (Array.isArray(fields)) {
    stringFields = fields.filter(
      (field): field is string => typeof field === 'string',
    );
  } else {
    return [];
  }

  if (stringFields.length === 0) {
    return [];
  }

  const invalidFields = stringFields.filter(
    (field) => !allowedFields.includes(field),
  );

  if (invalidFields.length > 0) {
    throw new BadRequestException(
      `Invalid fields requested: ${invalidFields.join(', ')}. Allowed fields: ${allowedFields.join(', ')}`,
    );
  }

  return [...new Set(stringFields)];
}
