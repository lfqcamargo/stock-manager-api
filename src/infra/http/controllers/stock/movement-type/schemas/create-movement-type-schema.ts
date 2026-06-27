import z from 'zod';

import { MovementDirection } from '@/domain/stock/enterprise/entities/movement-type';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const createMovementTypeBodySchema = z.object({
  name: z
    .string()
    .min(3)
    .max(255)
    .transform((s) => s.trim()),
  direction: z.nativeEnum(MovementDirection),
});

export type CreateMovementTypeBody = z.infer<
  typeof createMovementTypeBodySchema
>;
export const bodyValidationPipe = new ZodValidationPipe(
  createMovementTypeBodySchema,
);
