import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const deleteLocationParamsSchema = z.object({
  id: z.string(),
});

export type DeleteLocationParams = z.infer<typeof deleteLocationParamsSchema>;
export const paramsValidationPipe = new ZodValidationPipe(
  deleteLocationParamsSchema,
);
