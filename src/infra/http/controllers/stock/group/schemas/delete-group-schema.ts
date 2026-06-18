import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const deleteGroupParamsSchema = z.object({
  id: z.string(),
});

export type DeleteGroupParams = z.infer<typeof deleteGroupParamsSchema>;
export const paramsValidationPipe = new ZodValidationPipe(
  deleteGroupParamsSchema,
);
