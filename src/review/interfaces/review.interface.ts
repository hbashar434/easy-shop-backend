import { Status } from '@prisma/client';

export interface ReviewFilters {
  search?: string;
  status?: Status;
  productId?: number;
  userId?: string;
  rating?: number;
}
