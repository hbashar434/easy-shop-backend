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
  allowedRelations: string[] = [],
  allowedRelationFields: Record<string, string[]> = {},
): Prisma.UserSelect {
  if (!select || typeof select !== 'object') return {};
  const result: Record<string, any> = {};
  const selectObj = select as Record<string, unknown>;

  for (const key in selectObj) {
    // Handle regular fields
    if (allowedFields.includes(key as keyof T) && selectObj[key] === true) {
      result[key] = true;
    }
    // Handle relations
    else if (
      allowedRelations.includes(key) &&
      typeof selectObj[key] === 'object' &&
      selectObj[key] !== null
    ) {
      const relationSelect = selectObj[key] as Record<string, unknown>;
      if (
        'select' in relationSelect &&
        typeof relationSelect.select === 'object'
      ) {
        const sanitizedRelationSelect: Record<string, boolean> = {};
        const relationSelectObj = relationSelect.select as Record<
          string,
          unknown
        >;

        // Only allow fields that are in allowedRelationFields
        for (const field in relationSelectObj) {
          if (
            allowedRelationFields[key]?.includes(field) &&
            relationSelectObj[field] === true
          ) {
            sanitizedRelationSelect[field] = true;
          }
        }

        if (Object.keys(sanitizedRelationSelect).length > 0) {
          result[key] = {
            select: sanitizedRelationSelect,
          };
        }
      }
    }
  }
  return result;
}

function sanitizeRelationFields(
  relationData: unknown,
  allowedFields: string[],
): Record<string, boolean> {
  if (!relationData || typeof relationData !== 'object') return {};
  const result: Record<string, boolean> = {};
  const relationObj = relationData as Record<string, unknown>;

  for (const key in relationObj) {
    if (allowedFields.includes(key) && relationObj[key] === true) {
      result[key] = true;
    }
  }
  return result;
}

function sanitizeInclude(
  include: unknown,
  allowedRelations: string[],
  allowedRelationFields: Record<string, string[]> = {},
): Prisma.UserInclude {
  if (!include || typeof include !== 'object') return {};
  const result: Record<string, unknown> = {};
  const includeObj = include as Record<string, unknown>;

  for (const key in includeObj) {
    if (allowedRelations.includes(key)) {
      const relationValue = includeObj[key];

      if (relationValue === true) {
        // If it's just true, we need to restrict fields
        if (allowedRelationFields[key]) {
          result[key] = {
            select: Object.fromEntries(
              allowedRelationFields[key].map((field) => [field, true]),
            ),
          };
        }
      } else if (typeof relationValue === 'object' && relationValue !== null) {
        const relationObj = relationValue as Record<string, unknown>;
        const sanitizedRelation: Record<string, unknown> = {};

        // Handle select
        if ('select' in relationObj && typeof relationObj.select === 'object') {
          const sanitizedSelect = sanitizeRelationFields(
            relationObj.select,
            allowedRelationFields[key] || [],
          );
          if (Object.keys(sanitizedSelect).length > 0) {
            sanitizedRelation.select = sanitizedSelect;
          }
        } else if (allowedRelationFields[key]) {
          // If no select provided but we have allowed fields, use them
          sanitizedRelation.select = Object.fromEntries(
            allowedRelationFields[key].map((field) => [field, true]),
          );
        }

        // Handle where conditions
        if ('where' in relationObj && typeof relationObj.where === 'object') {
          sanitizedRelation.where = relationObj.where;
        }

        // Handle orderBy
        if ('orderBy' in relationObj) {
          if (typeof relationObj.orderBy === 'object') {
            sanitizedRelation.orderBy = relationObj.orderBy;
          }
        }

        // Handle pagination
        if ('take' in relationObj && typeof relationObj.take === 'number') {
          sanitizedRelation.take = relationObj.take;
        }
        if ('skip' in relationObj && typeof relationObj.skip === 'number') {
          sanitizedRelation.skip = relationObj.skip;
        }

        if (Object.keys(sanitizedRelation).length > 0) {
          result[key] = sanitizedRelation;
        }
      }
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
  allowedFields: (keyof Prisma.UserWhereInput)[],
  allowedRelations: string[],
  allowedRelationFields: Record<string, string[]> = {},
  defaultWhere: Prisma.UserWhereInput = {},
  defaultSelect: Prisma.UserSelect,
  defaultInclude: Prisma.UserInclude = {},
): Prisma.UserFindManyArgs {
  const queryObj = (query as Record<string, unknown>) || {};

  const dynamicWhere = sanitizeWhere(queryObj.where, allowedFields);
  const where: Prisma.UserWhereInput = {
    ...defaultWhere,
    ...dynamicWhere,
  };

  const userSelect = sanitizeSelect(
    queryObj.select,
    allowedFields,
    allowedRelations,
    allowedRelationFields,
  );

  const userInclude = sanitizeInclude(
    queryObj.include,
    allowedRelations,
    allowedRelationFields,
  );

  const orderBy = sanitizeOrderBy(queryObj.orderBy, allowedFields);
  const { take, skip } = sanitizePagination(queryObj.take, queryObj.skip);

  const queryOptions: Prisma.UserFindManyArgs = {
    where,
    orderBy,
    take,
    skip,
  };

  // Start with base select from defaultSelect
  const finalSelect: Record<string, any> = { ...defaultSelect };

  // If user specified select fields, merge them
  if (Object.keys(userSelect).length > 0) {
    Object.assign(finalSelect, userSelect);
  }

  // If user specified include or we have defaultInclude, convert to select
  if (Object.keys(userInclude).length > 0) {
    // Convert include to select structure
    Object.entries(userInclude).forEach(([relation, config]) => {
      if (config && typeof config === 'object' && 'select' in config) {
        finalSelect[relation] = config;
      }
    });
  } else if (Object.keys(defaultInclude).length > 0) {
    // Convert defaultInclude to select structure
    Object.entries(defaultInclude).forEach(([relation, config]) => {
      if (config && typeof config === 'object' && 'select' in config) {
        finalSelect[relation] = config;
      }
    });
  }

  queryOptions.select = finalSelect;
  return queryOptions;
}
