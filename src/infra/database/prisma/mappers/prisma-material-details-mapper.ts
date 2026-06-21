import {
  Group as PrismaGroup,
  Material as PrismaMaterial,
} from '@generated/prisma/client';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { MaterialDetails } from '@/domain/stock/enterprise/entities/value-objects/material-details';
import { UnitMeasure } from '@/domain/stock/enterprise/entities/value-objects/unit-measure';

type PrismaMaterialDetails = PrismaMaterial & {
  group: PrismaGroup;
};

export class PrismaMaterialDetailsMapper {
  static toDomain(raw: PrismaMaterialDetails): MaterialDetails {
    return MaterialDetails.create({
      companyId: new UniqueEntityID(raw.companyId),
      groupId: new UniqueEntityID(raw.groupId),
      group: raw.group.name,
      id: new UniqueEntityID(raw.id),
      code: raw.code,
      name: raw.name,
      description: raw.description,
      unit: UnitMeasure.fromCode(raw.unit),
      active: raw.active,
      photoUrl: raw.photoUrl ?? null,
    });
  }
}
