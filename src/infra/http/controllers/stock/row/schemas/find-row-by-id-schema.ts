import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const findRowByIdParamsSchema = z.object({ id: z.string() });

export type FindRowByIdParams = z.infer<typeof findRowByIdParamsSchema>;
export const paramsValidationPipe = new ZodValidationPipe(
  findRowByIdParamsSchema,
);
