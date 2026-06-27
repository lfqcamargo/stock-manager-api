import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const deleteMovementTypeParamsSchema = z.object({
  id: z.string().uuid(),
});

export type DeleteMovementTypeParams = z.infer<
  typeof deleteMovementTypeParamsSchema
>;
export const paramsValidationPipe = new ZodValidationPipe(
  deleteMovementTypeParamsSchema,
);
