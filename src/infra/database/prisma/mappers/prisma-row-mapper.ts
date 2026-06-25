import { Prisma, Row as PrismaRow } from '@generated/prisma/client';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Row } from '@/domain/stock/enterprise/entities/row';

export class PrismaRowMapper {
  static toDomain(raw: PrismaRow): Row {
    return Row.create(
      {
        companyId: new UniqueEntityID(raw.companyId),
        code: raw.code,
        name: raw.name,
        description: raw.description,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(row: Row): Prisma.RowUncheckedCreateInput {
    return {
      id: row.id.toString(),
      companyId: row.companyId.toString(),
      code: row.code,
      name: row.name,
      description: row.description,
    };
  }
}
