import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const findGroupByIdParamsSchema = z.object({
  id: z.string(),
});

export type FindGroupByIdParams = z.infer<typeof findGroupByIdParamsSchema>;
export const paramsValidationPipe = new ZodValidationPipe(
  findGroupByIdParamsSchema,
);
