import { Prisma } from '@prisma/client';

// Type Definitions
type OrderByDirection = 'asc' | 'desc';
type SanitizedOrderBy = Record<string, OrderByDirection>;
type QueryValue = string | number | boolean | null | Date;

// Generic type for Prisma select/include options
type PrismaRelationSelect =
  | {
      select?: Record<string, any>;
      where?: Record<string, unknown>;
      orderBy?: Record<string, OrderByDirection>;
      take?: number;
      skip?: number;
    }
  | boolean;

type PrismaSelect = Record<string, any>;
type PrismaInclude = Record<string, any>;

// Generic Prisma model arguments with type-safe select, where, and include
type PrismaModelArgs<
  TSelect extends Record<string, any>,
  TWhere extends Record<string, unknown>,
  TInclude extends Record<string, any>,
> = {
  where?: TWhere;
  select?: TSelect;
  include?: TInclude;
  orderBy?:
    | Record<string, OrderByDirection>
    | Array<Record<string, OrderByDirection>>;
  take?: number;
  skip?: number;
};

// Utility to check if a value is a non-null object
const isNonNullObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object';

// Sanitize Where Clause
function sanitizeWhere<TWhere extends Record<string, unknown>>(
  where: unknown,
  allowedFields: Array<keyof TWhere>,
): TWhere {
  if (!isNonNullObject(where)) return {} as TWhere;
  const result = {} as TWhere;

  for (const key of allowedFields) {
    if (key in where && where[key as keyof typeof where] !== undefined) {
      result[key] = where[key as keyof typeof where] as TWhere[typeof key];
    }
  }
  return result;
}

// Sanitize Select Clause
function sanitizeSelect<TSelect extends Record<string, any>>(
  select: unknown,
  allowedFields: Array<keyof TSelect>,
  allowedRelations: string[] = [],
  allowedRelationFields: Record<string, string[]> = {},
): TSelect {
  if (!isNonNullObject(select)) return {} as TSelect;
  const result = {} as Record<string, any>;
  const allowedFieldsSet = new Set(allowedFields);

  for (const key in select) {
    if (allowedFieldsSet.has(key as keyof TSelect) && select[key] === true) {
      result[key] = true;
    } else if (
      allowedRelations.includes(key) &&
      isNonNullObject(select[key]) &&
      'select' in select[key] &&
      isNonNullObject(select[key].select)
    ) {
      const relationSelect = sanitizeRelationFields(
        select[key].select,
        allowedRelationFields[key] || [],
      );
      if (Object.keys(relationSelect).length > 0) {
        result[key] = {
          select: relationSelect,
        };
      }
    }
  }
  return result as TSelect;
}

// Sanitize Relation Fields
function sanitizeRelationFields(
  relationData: unknown,
  allowedFields: string[],
): Record<string, boolean> {
  if (!isNonNullObject(relationData)) return {};
  const result: Record<string, boolean> = {};
  const allowedFieldsSet = new Set(allowedFields);

  for (const key of allowedFieldsSet) {
    if (key in relationData && relationData[key] === true) {
      result[key] = true;
    }
  }
  return result;
}

// Sanitize Relation Where Clause
function sanitizeRelationWhere(
  where: unknown,
  allowedFields: string[],
): Record<string, QueryValue> {
  if (!isNonNullObject(where)) return {};
  const result: Record<string, QueryValue> = {};
  const allowedFieldsSet = new Set(allowedFields);

  for (const key of allowedFieldsSet) {
    if (key in where && where[key] !== undefined) {
      result[key] = where[key] as QueryValue;
    }
  }
  return result;
}

// Sanitize Include Clause
function sanitizeInclude<TInclude extends PrismaInclude>(
  include: unknown,
  allowedRelations: string[],
  allowedRelationFields: Record<string, string[]> = {},
): TInclude {
  if (!isNonNullObject(include)) return {} as TInclude;
  const result = {} as TInclude;
  const allowedRelationsSet = new Set(allowedRelations);

  for (const key of allowedRelationsSet) {
    if (!(key in include)) continue;
    const relationValue = include[key];

    if (relationValue === true && allowedRelationFields[key]?.length) {
      result[key as keyof TInclude] = {
        select: Object.fromEntries(
          allowedRelationFields[key].map((field) => [field, true]),
        ),
      } as TInclude[keyof TInclude];
      continue;
    }

    if (!isNonNullObject(relationValue)) continue;
    const sanitizedRelation: PrismaRelationSelect = {};

    if (
      'select' in relationValue &&
      isNonNullObject(relationValue.select) &&
      allowedRelationFields[key]
    ) {
      const sanitizedSelect = sanitizeRelationFields(
        relationValue.select,
        allowedRelationFields[key],
      );
      if (Object.keys(sanitizedSelect).length > 0) {
        sanitizedRelation.select = sanitizedSelect;
      }
    }

    if ('where' in relationValue && isNonNullObject(relationValue.where)) {
      sanitizedRelation.where = sanitizeRelationWhere(
        relationValue.where,
        allowedRelationFields[key] || [],
      );
    }

    if ('orderBy' in relationValue && isNonNullObject(relationValue.orderBy)) {
      sanitizedRelation.orderBy = sanitizeOrderBy(
        relationValue.orderBy,
        allowedRelationFields[key] || [],
      )[0];
    }

    if ('take' in relationValue && typeof relationValue.take === 'number') {
      sanitizedRelation.take = Math.min(relationValue.take, 100);
    }

    if ('skip' in relationValue && typeof relationValue.skip === 'number') {
      sanitizedRelation.skip = Math.max(relationValue.skip, 0);
    }

    if (Object.keys(sanitizedRelation).length > 0) {
      result[key as keyof TInclude] =
        sanitizedRelation as TInclude[keyof TInclude];
    }
  }
  return result;
}

// Sanitize OrderBy Clause
function sanitizeOrderBy(
  orderBy: unknown,
  allowedFields: string[],
): SanitizedOrderBy[] {
  if (!orderBy) return [];
  const orderArray = Array.isArray(orderBy) ? orderBy : [orderBy];
  const sanitized: SanitizedOrderBy[] = [];
  const allowedFieldsSet = new Set(allowedFields);

  for (const obj of orderArray) {
    if (!isNonNullObject(obj)) continue;
    const clean: SanitizedOrderBy = {};

    for (const key of allowedFieldsSet) {
      if (key in obj && ['asc', 'desc'].includes(obj[key] as string)) {
        clean[key] = obj[key] as OrderByDirection;
      }
    }
    if (Object.keys(clean).length > 0) {
      sanitized.push(clean);
    }
  }
  return sanitized;
}

// Sanitize Pagination
function sanitizePagination(
  take: unknown,
  skip: unknown,
): { take: number; skip: number } {
  const defaultTake = 10;
  const defaultSkip = 0;

  const sanitizedTake =
    typeof take === 'number' && Number.isInteger(take) && take > 0
      ? Math.min(take, 100)
      : defaultTake;
  const sanitizedSkip =
    typeof skip === 'number' && Number.isInteger(skip) && skip >= 0
      ? skip
      : defaultSkip;

  return { take: sanitizedTake, skip: sanitizedSkip };
}

// Main Sanitize Query Function
export function sanitizeQuery<
  TSelect extends Record<string, any>,
  TWhere extends Record<string, unknown>,
  TInclude extends Record<string, any>,
>(
  query: unknown,
  config: {
    allowedFields: Array<keyof TSelect & keyof TWhere>;
    allowedRelations?: string[];
    allowedRelationFields?: Record<string, string[]>;
    defaultWhere?: TWhere;
    defaultSelect?: TSelect;
    defaultInclude?: TInclude;
  },
): PrismaModelArgs<TSelect, TWhere, TInclude> {
  const {
    allowedFields,
    allowedRelations = [],
    allowedRelationFields = {},
    defaultWhere = {} as TWhere,
    defaultSelect = {} as TSelect,
    defaultInclude = {} as TInclude,
  } = config;

  const queryObj = isNonNullObject(query) ? query : {};
  const dynamicWhere = sanitizeWhere<TWhere>(queryObj.where, allowedFields);
  const where =
    Object.keys(dynamicWhere).length > 0 ? dynamicWhere : defaultWhere;

  const dynamicSelect = sanitizeSelect<TSelect>(
    queryObj.select,
    allowedFields,
    allowedRelations,
    allowedRelationFields,
  );

  const dynamicInclude = sanitizeInclude<TInclude>(
    queryObj.include,
    allowedRelations,
    allowedRelationFields,
  );

  const dynamicExclude = new Set<string>();
  if (isNonNullObject(queryObj.include)) {
    for (const [key, value] of Object.entries(queryObj.include)) {
      if (value === false) {
        dynamicExclude.add(key);
      }
    }
  }

  const orderBy = sanitizeOrderBy(queryObj.orderBy, allowedFields as string[]);
  const { take, skip } = sanitizePagination(queryObj.take, queryObj.skip);

  const queryOptions: PrismaModelArgs<TSelect, TWhere, TInclude> = {
    where,
    orderBy,
    take,
    skip,
  };

  let finalSelect: TSelect = {} as TSelect;

  if (Object.keys(dynamicSelect).length > 0) {
    finalSelect = { ...dynamicSelect };
  } else if (Object.keys(defaultSelect).length > 0) {
    finalSelect = { ...defaultSelect };
  }

  if (Object.keys(dynamicInclude).length > 0) {
    for (const [key, config] of Object.entries(dynamicInclude)) {
      if (config && isNonNullObject(config)) {
        finalSelect[key as keyof TSelect] = config as TSelect[keyof TSelect];
      }
    }
  }

  if (Object.keys(defaultInclude).length > 0 && !queryObj.include) {
    for (const [key, config] of Object.entries(defaultInclude)) {
      if (
        config &&
        isNonNullObject(config) &&
        !dynamicExclude.has(key) &&
        !(key in finalSelect)
      ) {
        finalSelect[key as keyof TSelect] = config as TSelect[keyof TSelect];
      }
    }
  }

  if (Object.keys(finalSelect).length > 0) {
    queryOptions.select = finalSelect;
  }

  return queryOptions;
}

// Sanitize Query for Unique Records
export function sanitizeQueryForUnique<
  TSelect extends Record<string, any>,
  TWhere extends Record<string, unknown>,
  TInclude extends Record<string, any>,
>(
  query: unknown,
  config: {
    allowedFields: Array<keyof TSelect & keyof TWhere>;
    allowedRelations?: string[];
    allowedRelationFields?: Record<string, string[]>;
    defaultWhere: TWhere;
    defaultSelect: TSelect;
    defaultInclude?: TInclude;
  },
): {
  where: TWhere;
  select?: TSelect;
} {
  const queryOptions = sanitizeQuery<TSelect, TWhere, TInclude>(query, {
    ...config,
    defaultWhere: config.defaultWhere,
  });

  return {
    where: queryOptions.where ?? config.defaultWhere,
    ...(queryOptions.select && { select: queryOptions.select }),
  };
}
