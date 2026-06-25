import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const deleteSubLocationParamsSchema = z.object({ id: z.string() });

export type DeleteSubLocationParams = z.infer<
  typeof deleteSubLocationParamsSchema
>;
export const paramsValidationPipe = new ZodValidationPipe(
  deleteSubLocationParamsSchema,
);
