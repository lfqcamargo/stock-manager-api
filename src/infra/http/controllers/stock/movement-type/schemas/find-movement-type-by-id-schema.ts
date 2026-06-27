import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const findMovementTypeByIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type FindMovementTypeByIdParams = z.infer<
  typeof findMovementTypeByIdParamsSchema
>;
export const paramsValidationPipe = new ZodValidationPipe(
  findMovementTypeByIdParamsSchema,
);
