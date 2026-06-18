import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const editCompanyBodySchema = z.object({
  name: z
    .string()
    .min(3)
    .max(255)
    .transform((s) => s.trim()),
  photo: z.string().nullable().optional(),
});

export type EditCompanyBody = z.infer<typeof editCompanyBodySchema>;
export const bodyValidationPipe = new ZodValidationPipe(editCompanyBodySchema);
