import { Location as PrismaLocation, Prisma } from '@generated/prisma/client';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Location } from '@/domain/stock/enterprise/entities/location';

export class PrismaLocationMapper {
  static toDomain(raw: PrismaLocation): Location {
    return Location.create(
      {
        companyId: new UniqueEntityID(raw.companyId),
        code: raw.code,
        name: raw.name,
        description: raw.description,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(location: Location): Prisma.LocationUncheckedCreateInput {
    return {
      id: location.id.toString(),
      companyId: location.companyId.toString(),
      code: location.code,
      name: location.name,
      description: location.description,
    };
  }
}
