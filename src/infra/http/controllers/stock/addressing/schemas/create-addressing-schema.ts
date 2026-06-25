import z from 'zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const createAddressingBodySchema = z.object({
  locationId: z.string(),
  subLocationId: z.string(),
  rowId: z.string(),
  shelfId: z.string(),
  positionId: z.string(),
  materialId: z.string().optional(),
  active: z.boolean().default(true),
});

export type CreateAddressingBody = z.infer<typeof createAddressingBodySchema>;
export const bodyValidationPipe = new ZodValidationPipe(
  createAddressingBodySchema,
);
