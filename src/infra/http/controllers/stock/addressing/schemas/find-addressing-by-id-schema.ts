import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const findAddressingByIdParamsSchema = z.object({ id: z.string() });

export type FindAddressingByIdParams = z.infer<
  typeof findAddressingByIdParamsSchema
>;
export const paramsValidationPipe = new ZodValidationPipe(
  findAddressingByIdParamsSchema,
);
