import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const editRowBodySchema = z.object({
  name: z.string().min(3).max(255).transform((s) => s.trim()),
  code: z.string().min(1).max(50).transform((s) => s.trim().toUpperCase()),
  description: z.string().transform((s) => s.trim()).nullable(),
});

const editRowParamsSchema = z.object({ id: z.string() });

export type EditRowBody = z.infer<typeof editRowBodySchema>;
export type EditRowParams = z.infer<typeof editRowParamsSchema>;
export const bodyValidationPipe = new ZodValidationPipe(editRowBodySchema);
export const paramsValidationPipe = new ZodValidationPipe(editRowParamsSchema);
