import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const deleteRowParamsSchema = z.object({ id: z.string() });

export type DeleteRowParams = z.infer<typeof deleteRowParamsSchema>;
export const paramsValidationPipe = new ZodValidationPipe(deleteRowParamsSchema);
