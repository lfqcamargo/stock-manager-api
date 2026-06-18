import z from 'zod';

import { UserRole } from '@/domain/user/enterprise/entities/user';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const editUserParamsSchema = z.object({
  id: z.string(),
});

const editUserBodySchema = z.object({
  name: z
    .string()
    .min(3)
    .max(255)
    .transform((s) => s.trim()),
  email: z.email().optional(),
  role: z.nativeEnum(UserRole).optional(),
  active: z.boolean().optional(),
  photo: z.string().nullable().optional(),
});

export type EditUserBody = z.infer<typeof editUserBodySchema>;
export type EditUserParams = z.infer<typeof editUserParamsSchema>;

export const paramsValidationPipe = new ZodValidationPipe(editUserParamsSchema);
export const bodyValidationPipe = new ZodValidationPipe(editUserBodySchema);
