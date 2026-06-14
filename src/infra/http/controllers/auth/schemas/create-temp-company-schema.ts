import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { validateCNPJ } from '@/utils/validate-cnpj';

const createTempCompanyBodySchema = z.object({
  companyName: z
    .string()
    .min(4, 'companyName must be at least 4 characters long')
    .max(50, 'companyName must be at most 50 characters long')
    .trim()
    .regex(
      /^[\p{L}0-9&.,\-()\s]+$/u,
      'Company name contains invalid characters',
    ),
  companyCnpj: z
    .string()
    .min(14, 'companyCnpj must be at least 14 characters long')
    .max(14, 'companyCnpj must be at most 14 characters long')
    .trim()
    .transform((cnpj) => cnpj.replace(/\D/g, ''))
    .refine((cnpj) => cnpj.length === 14, {
      message: 'CNPJ must have exactly 14 digits',
    })
    .refine((cnpj) => validateCNPJ(cnpj), {
      message: 'Invalid CNPJ',
    }),
  userName: z
    .string()
    .min(4, 'userName must be at least 4 characters long')
    .max(50, 'userName must be at most 50 characters long')
    .trim()
    .regex(
      /^[\p{L}]+([\p{L}\s']+)?$/u,
      'User name must contain only letters and spaces',
    )
    .transform((name) => name.trim().replace(/\s+/g, ' '))
    .transform((name) =>
      name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
    ),
  userEmail: z.email({ message: 'Invalid email address' }).trim().toLowerCase(),
  userPassword: z
    .string()
    .min(6, 'userPassword must be at least 6 characters long')
    .max(50, 'userPassword must be at most 50 characters long'),
});

export type CreateTempCompanyBody = z.infer<typeof createTempCompanyBodySchema>;
export const bodyValidationPipe = new ZodValidationPipe(
  createTempCompanyBodySchema,
);
