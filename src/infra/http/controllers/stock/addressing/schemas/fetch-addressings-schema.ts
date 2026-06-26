import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const fetchAddressingsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  itemsPerPage: z.coerce.number().min(1).max(100).default(20),
  locationId: z.string().optional(),
  subLocationId: z.string().optional(),
  rowId: z.string().optional(),
  shelfId: z.string().optional(),
  positionId: z.string().optional(),
  materialId: z.string().optional(),
  active: z.coerce.boolean().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  orderBy: z.enum(['createdAt', 'amount', 'active']).optional(),
  orderDirection: z.enum(['asc', 'desc']).optional(),
});

export type FetchAddressingsQuery = z.infer<typeof fetchAddressingsQuerySchema>;
export const queryValidationPipe = new ZodValidationPipe(
  fetchAddressingsQuerySchema,
);
