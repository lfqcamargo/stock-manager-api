import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const fetchSubLocationsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  itemsPerPage: z.coerce.number().min(1).max(100).default(20),
  locationId: z.string().optional(),
  code: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  orderBy: z.enum(['name', 'description', 'code']).optional(),
  orderDirection: z.enum(['asc', 'desc']).optional(),
});

export type FetchSubLocationsQuery = z.infer<
  typeof fetchSubLocationsQuerySchema
>;
export const queryValidationPipe = new ZodValidationPipe(
  fetchSubLocationsQuerySchema,
);
