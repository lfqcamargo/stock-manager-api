import {
  Prisma,
  SubLocation as PrismaSubLocation,
} from '@generated/prisma/client';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { SubLocation } from '@/domain/stock/enterprise/entities/sub-location';

export class PrismaSubLocationMapper {
  static toDomain(raw: PrismaSubLocation): SubLocation {
    return SubLocation.create(
      {
        companyId: new UniqueEntityID(raw.companyId),
        locationId: new UniqueEntityID(raw.locationId),
        code: raw.code,
        name: raw.name,
        description: raw.description,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(
    subLocation: SubLocation,
  ): Prisma.SubLocationUncheckedCreateInput {
    return {
      id: subLocation.id.toString(),
      companyId: subLocation.companyId.toString(),
      locationId: subLocation.locationId.toString(),
      code: subLocation.code,
      name: subLocation.name,
      description: subLocation.description,
    };
  }
}
