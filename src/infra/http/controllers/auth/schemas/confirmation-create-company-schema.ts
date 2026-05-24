import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const confirmationCreateCompanyBodySchema = z.object({
  token: z.uuid({ message: 'Invalid token' }).trim(),
});

export type ConfirmationCreateCompanyBody = z.infer<
  typeof confirmationCreateCompanyBodySchema
>;
export const bodyValidationPipe = new ZodValidationPipe(
  confirmationCreateCompanyBodySchema,
);
