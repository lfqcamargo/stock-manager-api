import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const fetchMovementsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  itemsPerPage: z.coerce.number().min(1).max(100).default(20),
  addressingId: z.string().uuid().optional(),
  movementTypeId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  minQuantity: z.coerce.number().optional(),
  maxQuantity: z.coerce.number().optional(),
  orderBy: z.enum(['date', 'quantity', 'createdAt']).optional(),
  orderDirection: z.enum(['asc', 'desc']).optional(),
});

export type FetchMovementsQuery = z.infer<typeof fetchMovementsQuerySchema>;
export const queryValidationPipe = new ZodValidationPipe(
  fetchMovementsQuerySchema,
);
