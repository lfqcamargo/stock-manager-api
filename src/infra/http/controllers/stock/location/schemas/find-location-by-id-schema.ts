import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const findLocationByIdParamsSchema = z.object({
  id: z.string(),
});

export type FindLocationByIdParams = z.infer<
  typeof findLocationByIdParamsSchema
>;
export const paramsValidationPipe = new ZodValidationPipe(
  findLocationByIdParamsSchema,
);
