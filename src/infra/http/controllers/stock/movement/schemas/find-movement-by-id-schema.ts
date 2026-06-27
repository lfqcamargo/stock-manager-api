import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const findMovementByIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type FindMovementByIdParams = z.infer<
  typeof findMovementByIdParamsSchema
>;
export const paramsValidationPipe = new ZodValidationPipe(
  findMovementByIdParamsSchema,
);
