import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  MovementType,
  MovementTypeProps,
  MovementDirection,
} from '@/domain/stock/enterprise/entities/movement-type';
import { PrismaMovementTypeMapper } from '@/infra/database/prisma/mappers/prisma-movement-type-mapper';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

export function makeMovementType(
  override: Partial<MovementTypeProps> = {},
  id?: UniqueEntityID,
) {
  return MovementType.create(
    {
      companyId: new UniqueEntityID(),
      name: faker.commerce.department(),
      direction: faker.helpers.arrayElement([
        MovementDirection.IN,
        MovementDirection.OUT,
      ]),
      ...override,
    },
    id,
  );
}

@Injectable()
export class MovementTypeFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaMovementType(
    data: Partial<MovementTypeProps> = {},
  ): Promise<MovementType> {
    const mt = makeMovementType(data);

    await this.prisma.movementType.create({
      data: PrismaMovementTypeMapper.toPrisma(mt),
    });

    return mt;
  }
}
