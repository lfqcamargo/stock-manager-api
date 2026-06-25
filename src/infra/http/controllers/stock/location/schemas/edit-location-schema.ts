import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const editLocationBodySchema = z.object({
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

const editLocationParamsSchema = z.object({
  id: z.string(),
});

export type EditLocationBody = z.infer<typeof editLocationBodySchema>;
export type EditLocationParams = z.infer<typeof editLocationParamsSchema>;
export const bodyValidationPipe = new ZodValidationPipe(editLocationBodySchema);
export const paramsValidationPipe = new ZodValidationPipe(
  editLocationParamsSchema,
);
