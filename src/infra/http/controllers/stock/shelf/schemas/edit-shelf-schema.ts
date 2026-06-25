import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const editShelfBodySchema = z.object({
  name: z.string().min(3).max(255).transform((s) => s.trim()),
  code: z.string().min(1).max(50).transform((s) => s.trim().toUpperCase()),
  description: z.string().transform((s) => s.trim()).nullable(),
});

const editShelfParamsSchema = z.object({ id: z.string() });

export type EditShelfBody = z.infer<typeof editShelfBodySchema>;
export type EditShelfParams = z.infer<typeof editShelfParamsSchema>;
export const bodyValidationPipe = new ZodValidationPipe(editShelfBodySchema);
export const paramsValidationPipe = new ZodValidationPipe(editShelfParamsSchema);
