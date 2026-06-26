import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const createShelfBodySchema = z.object({
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
    .optional(),
});

export type CreateShelfBody = z.infer<typeof createShelfBodySchema>;
export const bodyValidationPipe = new ZodValidationPipe(createShelfBodySchema);
