import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const deletePositionParamsSchema = z.object({ id: z.string() });

export type DeletePositionParams = z.infer<typeof deletePositionParamsSchema>;
export const paramsValidationPipe = new ZodValidationPipe(
  deletePositionParamsSchema,
);
