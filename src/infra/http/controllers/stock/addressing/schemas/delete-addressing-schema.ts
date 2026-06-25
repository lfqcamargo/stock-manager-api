import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const deleteAddressingParamsSchema = z.object({ id: z.string() });

export type DeleteAddressingParams = z.infer<
  typeof deleteAddressingParamsSchema
>;
export const paramsValidationPipe = new ZodValidationPipe(
  deleteAddressingParamsSchema,
);
