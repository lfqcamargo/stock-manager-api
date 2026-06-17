import z from 'zod';

import { UserRole } from '@/domain/user/enterprise/entities/user';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const createTempUserBodySchema = z.object({
  email: z
    .email('Invalid email format')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email must be at most 255 characters')
    .transform((email) => email.toLowerCase().trim()),

  name: z
    .string()
    .min(3, 'User name must be at least 3 characters')
    .max(255, 'User name must be at most 255 characters')
    .transform((name) => name.trim()),

  role: z.nativeEnum(UserRole),

  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be at most 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    ),
});

export type CreateTempUserBody = z.infer<typeof createTempUserBodySchema>;
export const bodyValidationPipe = new ZodValidationPipe(
  createTempUserBodySchema,
);
