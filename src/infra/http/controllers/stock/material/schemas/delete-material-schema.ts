import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const deleteMaterialParamsSchema = z.object({
  id: z.string(),
});

export type DeleteMaterialParams = z.infer<typeof deleteMaterialParamsSchema>;
export const paramsValidationPipe = new ZodValidationPipe(
  deleteMaterialParamsSchema,
);
