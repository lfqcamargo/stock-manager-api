import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const exchangePasswordForTokenBodySchema = z.object({
  token: z.string().uuid(),
  password: z.string().min(6).max(100),
});

export type ExchangePasswordForTokenBody = z.infer<
  typeof exchangePasswordForTokenBodySchema
>;
export const bodyValidationPipe = new ZodValidationPipe(
  exchangePasswordForTokenBodySchema,
);
