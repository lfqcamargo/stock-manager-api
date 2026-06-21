import {
  Material as PrismaMaterial,
  Prisma,
  UnitMeasure as PrismaUnitMeasure,
} from '@generated/prisma/client';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Material } from '@/domain/stock/enterprise/entities/material';
import { UnitMeasure } from '@/domain/stock/enterprise/entities/value-objects/unit-measure';

export class PrismaMaterialMapper {
  static toDomain(raw: PrismaMaterial): Material {
    return Material.create(
      {
        companyId: new UniqueEntityID(raw.companyId),
        groupId: new UniqueEntityID(raw.groupId),
        code: raw.code,
        name: raw.name,
        description: raw.description,
        unit: UnitMeasure.fromCode(raw.unit),
        active: raw.active,
        photoUrl: raw.photoUrl ?? null,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(material: Material): Prisma.MaterialUncheckedCreateInput {
    return {
      companyId: material.companyId.toString(),
      groupId: material.groupId.toString(),
      id: material.id.toString(),
      code: material.code,
      name: material.name,
      description: material.description,
      unit: material.unit.toString() as PrismaUnitMeasure,
      active: material.active,
      photoUrl: material.photoUrl ?? null,
    };
  }
}
