import { Prisma } from '@prisma/client';

type OrderByDirection = 'asc' | 'desc';
type SanitizedOrderBy = Record<string, OrderByDirection>;
type QueryValue = string | number | boolean | null;
type WhereInput = Record<string, QueryValue>;

function sanitizeWhere<T extends Record<string, any>>(
  where: unknown,
  allowedFields: (keyof T)[],
): Prisma.UserWhereInput {
  if (!where || typeof where !== 'object') return {};
  const result: Record<string, any> = {};
  const whereObj = where as Record<string, unknown>;

  for (const key in whereObj) {
    if (
      allowedFields.includes(key as keyof T) &&
      typeof whereObj[key] !== 'undefined'
    ) {
      result[key] = whereObj[key];
    }
  }
  return result;
}

function sanitizeSelect<T extends Record<string, any>>(
  select: unknown,
  allowedFields: (keyof T)[],
): Prisma.UserSelect {
  if (!select || typeof select !== 'object') return {};
  const result: Record<string, boolean> = {};
  const selectObj = select as Record<string, unknown>;

  for (const key in selectObj) {
    if (allowedFields.includes(key as keyof T) && selectObj[key] === true) {
      result[key] = true;
    }
  }
  return result;
}

function sanitizeInclude(
  include: unknown,
  allowedRelations: string[],
): Prisma.UserInclude {
  if (!include || typeof include !== 'object') return {};
  const result: Record<string, unknown> = {};
  const includeObj = include as Record<string, unknown>;

  for (const key in includeObj) {
    if (allowedRelations.includes(key)) {
      result[key] = includeObj[key];
    }
  }
  return result;
}

function sanitizeOrderBy(
  orderBy: unknown,
  allowedFields: string[],
): Prisma.UserOrderByWithRelationInput[] {
  if (!orderBy || typeof orderBy !== 'object') return [];

  const orderArray = Array.isArray(orderBy) ? orderBy : [orderBy];
  const sanitized: Prisma.UserOrderByWithRelationInput[] = [];

  for (const obj of orderArray) {
    if (typeof obj !== 'object' || obj === null) continue;

    const clean: SanitizedOrderBy = {};
    const orderObj = obj as Record<string, unknown>;

    for (const key in orderObj) {
      const value = orderObj[key];
      if (
        allowedFields.includes(key) &&
        typeof value === 'string' &&
        ['asc', 'desc'].includes(value)
      ) {
        clean[key] = value as OrderByDirection;
      }
    }

    if (Object.keys(clean).length > 0) {
      sanitized.push(clean as Prisma.UserOrderByWithRelationInput);
    }
  }

  return sanitized;
}

function sanitizePagination(
  take: unknown,
  skip: unknown,
): { take: number; skip: number } {
  const sanitizedTake = typeof take === 'number' && take > 0 ? take : 10;
  const sanitizedSkip = typeof skip === 'number' && skip >= 0 ? skip : 0;

  return { take: sanitizedTake, skip: sanitizedSkip };
}

export function sanitizeQuery(
  query: unknown,
  defaultWhere: Prisma.UserWhereInput = {},
  defaultSelect: Prisma.UserSelect,
  allowedFields: (keyof Prisma.UserWhereInput)[],
  allowedRelations: string[],
): Prisma.UserFindManyArgs {
  const queryObj = (query as Record<string, unknown>) || {};

  const dynamicWhere = sanitizeWhere(queryObj.where, allowedFields);
  const where: Prisma.UserWhereInput = {
    ...defaultWhere,
    ...dynamicWhere,
  };

  const select = sanitizeSelect(queryObj.select, allowedFields);
  const include = sanitizeInclude(queryObj.include, allowedRelations);
  const orderBy = sanitizeOrderBy(queryObj.orderBy, allowedFields);
  const { take, skip } = sanitizePagination(queryObj.take, queryObj.skip);

  const queryOptions: Prisma.UserFindManyArgs = {
    where,
    orderBy,
    take,
    skip,
  };

  if (Object.keys(select).length > 0) {
    queryOptions.select = select;
  } else if (Object.keys(include).length === 0) {
    queryOptions.select = defaultSelect;
  }

  if (Object.keys(include).length > 0) {
    queryOptions.include = include;
  }

  return queryOptions;
}
