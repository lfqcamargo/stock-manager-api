import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const editSubLocationBodySchema = z.object({
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

const editSubLocationParamsSchema = z.object({ id: z.string() });

export type EditSubLocationBody = z.infer<typeof editSubLocationBodySchema>;
export type EditSubLocationParams = z.infer<typeof editSubLocationParamsSchema>;
export const bodyValidationPipe = new ZodValidationPipe(
  editSubLocationBodySchema,
);
export const paramsValidationPipe = new ZodValidationPipe(
  editSubLocationParamsSchema,
);
