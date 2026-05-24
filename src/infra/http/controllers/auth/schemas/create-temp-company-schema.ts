import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const createTempCompanyBodySchema = z.object({
  companyName: z
    .string()
    .min(4, 'companyName must be at least 4 characters long')
    .max(50, 'companyName must be at most 50 characters long')
    .trim(),
  companyCnpj: z
    .string()
    .min(14, 'companyCnpj must be at least 14 characters long')
    .max(14, 'companyCnpj must be at most 14 characters long')
    .trim(),
  userName: z
    .string()
    .min(4, 'userName must be at least 4 characters long')
    .max(50, 'userName must be at most 50 characters long')
    .trim(),
  userEmail: z.email({ message: 'Invalid email address' }).trim(),
  userPassword: z
    .string()
    .min(6, 'userPassword must be at least 6 characters long')
    .max(50, 'userPassword must be at most 50 characters long'),
});

export type CreateTempCompanyBody = z.infer<typeof createTempCompanyBodySchema>;
export const bodyValidationPipe = new ZodValidationPipe(
  createTempCompanyBodySchema,
);
