import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const generateNewPasswordTokenBodySchema = z.object({
  email: z
    .email('Invalid email format')
    .transform((email) => email.toLowerCase().trim()),
});

export type GenerateNewPasswordTokenBody = z.infer<
  typeof generateNewPasswordTokenBodySchema
>;
export const bodyValidationPipe = new ZodValidationPipe(
  generateNewPasswordTokenBodySchema,
);
