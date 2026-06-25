import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const editAddressingBodySchema = z.object({
  active: z.boolean(),
  materialId: z.string().nullable(),
});

const editAddressingParamsSchema = z.object({ id: z.string() });

export type EditAddressingBody = z.infer<typeof editAddressingBodySchema>;
export type EditAddressingParams = z.infer<typeof editAddressingParamsSchema>;
export const bodyValidationPipe = new ZodValidationPipe(
  editAddressingBodySchema,
);
export const paramsValidationPipe = new ZodValidationPipe(
  editAddressingParamsSchema,
);
