import { Status } from '@prisma/client';

export interface CategoryFilters {
  search?: string;
  status?: Status;
  parentId?: number;
  depth?: number;
}

