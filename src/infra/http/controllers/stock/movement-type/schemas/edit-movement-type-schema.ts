import z from 'zod';

import { MovementDirection } from '@/domain/stock/enterprise/entities/movement-type';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const editMovementTypeBodySchema = z.object({
  name: z
    .string()
    .min(3)
    .max(255)
    .transform((s) => s.trim()),
  direction: z.nativeEnum(MovementDirection),
});

const editMovementTypeParamsSchema = z.object({
  id: z.string().uuid(),
});

export type EditMovementTypeBody = z.infer<typeof editMovementTypeBodySchema>;
export type EditMovementTypeParams = z.infer<
  typeof editMovementTypeParamsSchema
>;
export const bodyValidationPipe = new ZodValidationPipe(
  editMovementTypeBodySchema,
);
export const paramsValidationPipe = new ZodValidationPipe(
  editMovementTypeParamsSchema,
);
