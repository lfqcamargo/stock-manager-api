import z from 'zod';

import { UnitMeasure } from '@/domain/stock/enterprise/entities/value-objects/unit-measure';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const createMaterialBodySchema = z.object({
  name: z
    .string()
    .min(3)
    .max(255)
    .transform((s) => s.trim()),
  code: z
    .string()
    .min(1)
    .max(50)
    .transform((s) => s.trim().toUpperCase()),
  description: z
    .string()
    .transform((s) => s.trim())
    .optional(),
  unit: z.enum(UnitMeasure.availableCodes),
  active: z.boolean().default(true),
  groupId: z.string(),
  photoUrl: z.string().nullable().optional(),
});

export type CreateMaterialBody = z.infer<typeof createMaterialBodySchema>;
export const bodyValidationPipe = new ZodValidationPipe(
  createMaterialBodySchema,
);
