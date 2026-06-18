import z from 'zod';

import { UnitMeasure } from '@/domain/stock/enterprise/entities/value-objects/unit-measure';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const editMaterialBodySchema = z.object({
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
    .nullable(),
  unit: z.enum(UnitMeasure.availableCodes),
  active: z.boolean(),
  groupId: z.string(),
});

const editMaterialParamsSchema = z.object({
  id: z.string(),
});

export type EditMaterialBody = z.infer<typeof editMaterialBodySchema>;
export type EditMaterialParams = z.infer<typeof editMaterialParamsSchema>;
export const bodyValidationPipe = new ZodValidationPipe(editMaterialBodySchema);
export const paramsValidationPipe = new ZodValidationPipe(
  editMaterialParamsSchema,
);
