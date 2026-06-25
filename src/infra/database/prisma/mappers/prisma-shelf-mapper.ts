import { Prisma, Shelf as PrismaShelf } from '@generated/prisma/client';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Shelf } from '@/domain/stock/enterprise/entities/shelf';

export class PrismaShelfMapper {
  static toDomain(raw: PrismaShelf): Shelf {
    return Shelf.create(
      {
        companyId: new UniqueEntityID(raw.companyId),
        code: raw.code,
        name: raw.name,
        description: raw.description,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(shelf: Shelf): Prisma.ShelfUncheckedCreateInput {
    return {
      id: shelf.id.toString(),
      companyId: shelf.companyId.toString(),
      code: shelf.code,
      name: shelf.name,
      description: shelf.description,
    };
  }
}
