import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const editGroupBodySchema = z.object({
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
  active: z.boolean(),
  photoUrl: z.string().nullable().optional(),
});

const editGroupParamsSchema = z.object({
  id: z.string(),
});

export type EditGroupBody = z.infer<typeof editGroupBodySchema>;
export type EditGroupParams = z.infer<typeof editGroupParamsSchema>;
export const bodyValidationPipe = new ZodValidationPipe(editGroupBodySchema);
export const paramsValidationPipe = new ZodValidationPipe(
  editGroupParamsSchema,
);
