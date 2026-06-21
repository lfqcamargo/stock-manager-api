import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const createGroupBodySchema = z.object({
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
  active: z.boolean().default(true),
  photoUrl: z.string().nullable().optional(),
});

export type CreateGroupBody = z.infer<typeof createGroupBodySchema>;
export const bodyValidationPipe = new ZodValidationPipe(createGroupBodySchema);
