import z from 'zod';

import { zodBooleanQuery } from '@/infra/http/pipes/zod-boolean-query';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const fetchGroupsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  itemsPerPage: z.coerce.number().min(1).max(9999).default(20),
  code: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  active: zodBooleanQuery,
  orderBy: z.enum(['name', 'description', 'code', 'active']).optional(),
  orderDirection: z.enum(['asc', 'desc']).optional(),
});

export type FetchGroupsQuery = z.infer<typeof fetchGroupsQuerySchema>;
export const queryValidationPipe = new ZodValidationPipe(
  fetchGroupsQuerySchema,
);
