import { Status } from '@prisma/client';

export interface BrandFilters {
  search?: string;
  status?: Status;
}

