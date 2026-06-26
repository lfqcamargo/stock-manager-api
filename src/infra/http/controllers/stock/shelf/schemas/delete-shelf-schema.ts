import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const deleteShelfParamsSchema = z.object({ id: z.string() });

export type DeleteShelfParams = z.infer<typeof deleteShelfParamsSchema>;
export const paramsValidationPipe = new ZodValidationPipe(
  deleteShelfParamsSchema,
);
