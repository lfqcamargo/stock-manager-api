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

        movementTypeName: raw.movementTypeName,
        movementTypeDirection: raw.movementTypeDirection as 'IN' | 'OUT',
        userName: raw.userName,

        locationId: raw.locationId,
        locationCode: raw.locationCode,
        locationName: raw.locationName,

        subLocationId: raw.subLocationId,
        subLocationCode: raw.subLocationCode,
        subLocationName: raw.subLocationName,

        rowId: raw.rowId,
        rowCode: raw.rowCode,
        rowName: raw.rowName,

        shelfId: raw.shelfId,
        shelfCode: raw.shelfCode,
        shelfName: raw.shelfName,

        positionId: raw.positionId,
        positionCode: raw.positionCode,
        positionName: raw.positionName,

        materialId: raw.materialId,
        materialCode: raw.materialCode,
        materialName: raw.materialName,
        materialDescription: raw.materialDescription,
        materialUnit: raw.materialUnit,
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

      movementTypeName: movement.movementTypeName,
      movementTypeDirection: movement.movementTypeDirection,
      userName: movement.userName,

      locationId: movement.locationId,
      locationCode: movement.locationCode,
      locationName: movement.locationName,

      subLocationId: movement.subLocationId,
      subLocationCode: movement.subLocationCode,
      subLocationName: movement.subLocationName,

      rowId: movement.rowId,
      rowCode: movement.rowCode,
      rowName: movement.rowName,

      shelfId: movement.shelfId,
      shelfCode: movement.shelfCode,
      shelfName: movement.shelfName,

      positionId: movement.positionId,
      positionCode: movement.positionCode,
      positionName: movement.positionName,

      materialId: movement.materialId,
      materialCode: movement.materialCode,
      materialName: movement.materialName,
      materialDescription: movement.materialDescription,
      materialUnit: movement.materialUnit,
    };
  }
}
