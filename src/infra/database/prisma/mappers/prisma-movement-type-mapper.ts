import { MovementType as PrismaMovementType, Prisma } from '@generated/prisma/client';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  MovementType,
  MovementDirection,
} from '@/domain/stock/enterprise/entities/movement-type';

export class PrismaMovementTypeMapper {
  static toDomain(raw: PrismaMovementType): MovementType {
    return MovementType.create(
      {
        companyId: new UniqueEntityID(raw.companyId),
        name: raw.name,
        direction: raw.direction as MovementDirection,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(
    movementType: MovementType,
  ): Prisma.MovementTypeUncheckedCreateInput {
    return {
      id: movementType.id.toString(),
      companyId: movementType.companyId.toString(),
      name: movementType.name,
      direction: movementType.direction,
    };
  }
}
