import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const authenticateUserBodySchema = z.object({
  email: z
    .email('Invalid email format')
    .transform((email) => email.toLowerCase().trim()),
  password: z.string().min(6).max(100),
});

export type AuthenticateUserBody = z.infer<typeof authenticateUserBodySchema>;
export const bodyValidationPipe = new ZodValidationPipe(
  authenticateUserBodySchema,
);
