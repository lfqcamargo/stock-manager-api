import {
  Addressing as PrismaAddressing,
  Prisma,
} from '@generated/prisma/client';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Addressing } from '@/domain/stock/enterprise/entities/addressing';

export class PrismaAddressingMapper {
  static toDomain(raw: PrismaAddressing): Addressing {
    return Addressing.create(
      {
        companyId: new UniqueEntityID(raw.companyId),
        locationId: new UniqueEntityID(raw.locationId),
        subLocationId: new UniqueEntityID(raw.subLocationId),
        rowId: new UniqueEntityID(raw.rowId),
        shelfId: new UniqueEntityID(raw.shelfId),
        positionId: new UniqueEntityID(raw.positionId),
        materialId: raw.materialId ? new UniqueEntityID(raw.materialId) : null,
        amount: raw.amount,
        active: raw.active,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(
    addressing: Addressing,
  ): Prisma.AddressingUncheckedCreateInput {
    return {
      id: addressing.id.toString(),
      companyId: addressing.companyId.toString(),
      locationId: addressing.locationId.toString(),
      subLocationId: addressing.subLocationId.toString(),
      rowId: addressing.rowId.toString(),
      shelfId: addressing.shelfId.toString(),
      positionId: addressing.positionId.toString(),
      materialId: addressing.materialId?.toString() ?? null,
      amount: addressing.amount,
      active: addressing.active,
    };
  }
}
