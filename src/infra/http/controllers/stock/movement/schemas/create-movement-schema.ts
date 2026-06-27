import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const createMovementBodySchema = z.object({
  addressingId: z.string().uuid(),
  movementTypeId: z.string().uuid(),
  quantity: z.number().positive(),
  date: z.coerce.date().optional(),
  observation: z.string().optional(),
});

export type CreateMovementBody = z.infer<typeof createMovementBodySchema>;
export const bodyValidationPipe = new ZodValidationPipe(
  createMovementBodySchema,
);
