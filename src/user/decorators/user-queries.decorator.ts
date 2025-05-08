import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export function ApiAllUserQueries() {
  return applyDecorators(
    ApiQuery({
      name: 'search',
      required: false,
      description: 'Search by name, email or phone',
    }),
    ApiQuery({
      name: 'role',
      required: false,
      enum: Role,
      description: 'Filter by role',
    }),
    ApiQuery({
      name: 'isActive',
      required: false,
      type: Boolean,
      description: 'Filter by active status',
    }),
    ApiQuery({
      name: 'isEmailVerified',
      required: false,
      type: Boolean,
      description: 'Filter by email verification status',
    }),
    ApiQuery({
      name: 'isPhoneVerified',
      required: false,
      type: Boolean,
      description: 'Filter by phone verification status',
    }),
    ApiQuery({
      name: 'isProfileComplete',
      required: false,
      type: Boolean,
      description: 'Filter by profile completion status',
    }),
    ApiQuery({
      name: 'startDate',
      required: false,
      type: Date,
      description: 'Filter by start date',
    }),
    ApiQuery({
      name: 'endDate',
      required: false,
      type: Date,
      description: 'Filter by end date',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (starts from 1)',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of items per page',
      example: 10,
    }),
  );
}
