import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const confirmationCreateUserParamsSchema = z.object({
  token: z.string().transform((token) => token.trim()),
});

export type ConfirmationCreateUserParams = z.infer<
  typeof confirmationCreateUserParamsSchema
>;

export const paramsValidationPipe = new ZodValidationPipe(
  confirmationCreateUserParamsSchema,
);
