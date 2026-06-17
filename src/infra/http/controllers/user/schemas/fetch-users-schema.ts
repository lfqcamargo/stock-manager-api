import z from 'zod';

import { UserRole } from '@/domain/user/enterprise/entities/user';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const fetchUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  itemsPerPage: z.coerce.number().min(1).max(100).default(20),

  email: z.string().optional(),
  name: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  active: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  createdAt: z.coerce.date().optional(),
  lastLogin: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional(),
});

export type FetchUsersQuery = z.infer<typeof fetchUsersQuerySchema>;

export const queryValidationPipe = new ZodValidationPipe(fetchUsersQuerySchema);
