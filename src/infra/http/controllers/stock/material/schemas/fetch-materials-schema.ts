import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const fetchMaterialsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  itemsPerPage: z.coerce.number().min(1).max(100).default(20),
  groupId: z.string().optional(),
  code: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  active: z.coerce.boolean().optional(),
  orderBy: z.enum(['name', 'code', 'unit', 'active', 'groupId']).optional(),
  orderDirection: z.enum(['asc', 'desc']).optional(),
});

export type FetchMaterialsQuery = z.infer<typeof fetchMaterialsQuerySchema>;
export const queryValidationPipe = new ZodValidationPipe(
  fetchMaterialsQuerySchema,
);
