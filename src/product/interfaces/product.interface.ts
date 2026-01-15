import { Status } from '@prisma/client';

export interface ProductFilters {
  search?: string;
  status?: Status;
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
}

