import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const deleteUserParamsSchema = z.object({
  id: z.string(),
});

export type DeleteUserParams = z.infer<typeof deleteUserParamsSchema>;
export const paramsValidationPipe = new ZodValidationPipe(
  deleteUserParamsSchema,
);
