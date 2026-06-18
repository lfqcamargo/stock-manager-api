import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const findMaterialByIdParamsSchema = z.object({
  id: z.string(),
});

export type FindMaterialByIdParams = z.infer<
  typeof findMaterialByIdParamsSchema
>;
export const paramsValidationPipe = new ZodValidationPipe(
  findMaterialByIdParamsSchema,
);
