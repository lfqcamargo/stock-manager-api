import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const editPositionBodySchema = z.object({
  name: z
    .string()
    .min(3)
    .max(255)
    .transform((s) => s.trim()),
  code: z
    .string()
    .min(1)
    .max(50)
    .transform((s) => s.trim().toUpperCase()),
  description: z
    .string()
    .transform((s) => s.trim())
    .nullable(),
});

const editPositionParamsSchema = z.object({ id: z.string() });

export type EditPositionBody = z.infer<typeof editPositionBodySchema>;
export type EditPositionParams = z.infer<typeof editPositionParamsSchema>;
export const bodyValidationPipe = new ZodValidationPipe(editPositionBodySchema);
export const paramsValidationPipe = new ZodValidationPipe(
  editPositionParamsSchema,
);
