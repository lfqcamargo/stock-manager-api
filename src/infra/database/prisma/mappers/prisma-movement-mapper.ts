import { Movement as PrismaMovement, Prisma } from '@generated/prisma/client';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Movement } from '@/domain/stock/enterprise/entities/movement';

export class PrismaMovementMapper {
  static toDomain(raw: PrismaMovement): Movement {
    return Movement.create(
      {
        companyId: new UniqueEntityID(raw.companyId),
        addressingId: new UniqueEntityID(raw.addressingId),
        movementTypeId: new UniqueEntityID(raw.movementTypeId),
        userId: new UniqueEntityID(raw.userId),
        quantity: raw.quantity,
        date: raw.date,
        observation: raw.observation,
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(movement: Movement): Prisma.MovementUncheckedCreateInput {
    return {
      id: movement.id.toString(),
      companyId: movement.companyId.toString(),
      addressingId: movement.addressingId.toString(),
      movementTypeId: movement.movementTypeId.toString(),
      userId: movement.userId.toString(),
      quantity: movement.quantity,
      date: movement.date,
      observation: movement.observation,
      createdAt: movement.createdAt,
    };
  }
}
