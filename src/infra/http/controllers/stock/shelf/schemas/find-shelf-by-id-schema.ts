import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const findShelfByIdParamsSchema = z.object({ id: z.string() });

export type FindShelfByIdParams = z.infer<typeof findShelfByIdParamsSchema>;
export const paramsValidationPipe = new ZodValidationPipe(findShelfByIdParamsSchema);
