import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const findPositionByIdParamsSchema = z.object({ id: z.string() });

export type FindPositionByIdParams = z.infer<
  typeof findPositionByIdParamsSchema
>;
export const paramsValidationPipe = new ZodValidationPipe(
  findPositionByIdParamsSchema,
);
