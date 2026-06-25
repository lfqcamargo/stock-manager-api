import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  Position,
  PositionProps,
} from '@/domain/stock/enterprise/entities/position';
import { PrismaPositionMapper } from '@/infra/database/prisma/mappers/prisma-position-mapper';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

export function makePosition(
  override: Partial<PositionProps> = {},
  id?: UniqueEntityID,
) {
  const position = Position.create(
    {
      companyId: new UniqueEntityID(faker.string.uuid()),
      code: faker.lorem.slug(2).toUpperCase(),
      name: faker.commerce.product(),
      description: faker.lorem.text(),
      ...override,
    },
    id,
  );

  return position;
}

@Injectable()
export class PositionFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaPosition(data: Partial<PositionProps> = {}): Promise<Position> {
    const position = makePosition(data);

    await this.prisma.position.create({
      data: PrismaPositionMapper.toPrisma(position),
    });

    return position;
  }
}
