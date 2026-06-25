import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const findSubLocationByIdParamsSchema = z.object({ id: z.string() });

export type FindSubLocationByIdParams = z.infer<
  typeof findSubLocationByIdParamsSchema
>;
export const paramsValidationPipe = new ZodValidationPipe(
  findSubLocationByIdParamsSchema,
);
