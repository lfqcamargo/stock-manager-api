import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Row, RowProps } from '@/domain/stock/enterprise/entities/row';
import { PrismaRowMapper } from '@/infra/database/prisma/mappers/prisma-row-mapper';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

export function makeRow(override: Partial<RowProps> = {}, id?: UniqueEntityID) {
  const row = Row.create(
    {
      companyId: new UniqueEntityID(faker.string.uuid()),
      code: faker.lorem.slug(2).toUpperCase(),
      name: faker.commerce.product(),
      description: faker.lorem.text(),
      ...override,
    },
    id,
  );

  return row;
}

@Injectable()
export class RowFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaRow(data: Partial<RowProps> = {}): Promise<Row> {
    const row = makeRow(data);

    await this.prisma.row.create({
      data: PrismaRowMapper.toPrisma(row),
    });

    return row;
  }
}
