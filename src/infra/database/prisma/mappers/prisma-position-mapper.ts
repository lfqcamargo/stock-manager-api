import { Position as PrismaPosition, Prisma } from '@generated/prisma/client';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Position } from '@/domain/stock/enterprise/entities/position';

export class PrismaPositionMapper {
  static toDomain(raw: PrismaPosition): Position {
    return Position.create(
      {
        companyId: new UniqueEntityID(raw.companyId),
        code: raw.code,
        name: raw.name,
        description: raw.description,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(position: Position): Prisma.PositionUncheckedCreateInput {
    return {
      id: position.id.toString(),
      companyId: position.companyId.toString(),
      code: position.code,
      name: position.name,
      description: position.description,
    };
  }
}
