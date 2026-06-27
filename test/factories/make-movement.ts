import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  Movement,
  MovementProps,
} from '@/domain/stock/enterprise/entities/movement';
import { PrismaMovementMapper } from '@/infra/database/prisma/mappers/prisma-movement-mapper';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

export function makeMovement(
  override: Partial<MovementProps> = {},
  id?: UniqueEntityID,
) {
  return Movement.create(
    {
      companyId: new UniqueEntityID(),
      addressingId: new UniqueEntityID(),
      movementTypeId: new UniqueEntityID(),
      userId: new UniqueEntityID(),
      quantity: faker.number.int({ min: 1, max: 100 }),
      date: faker.date.recent(),
      observation: faker.helpers.maybe(() => faker.lorem.sentence()),
      ...override,
    },
    id,
  );
}

@Injectable()
export class MovementFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaMovement(
    data: Partial<MovementProps> = {},
  ): Promise<Movement> {
    const m = makeMovement(data);

    await this.prisma.movement.create({
      data: PrismaMovementMapper.toPrisma(m),
    });

    return m;
  }
}
