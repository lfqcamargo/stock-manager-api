import z from 'zod';

import { MovementDirection } from '@/domain/stock/enterprise/entities/movement-type';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const fetchMovementTypesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  itemsPerPage: z.coerce.number().min(1).max(100).default(20),
  name: z.string().optional(),
  direction: z.nativeEnum(MovementDirection).optional(),
  orderBy: z.enum(['name', 'direction']).optional(),
  orderDirection: z.enum(['asc', 'desc']).optional(),
});

export type FetchMovementTypesQuery = z.infer<
  typeof fetchMovementTypesQuerySchema
>;
export const queryValidationPipe = new ZodValidationPipe(
  fetchMovementTypesQuerySchema,
);
