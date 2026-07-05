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
      observation: faker.helpers.maybe(() => faker.lorem.sentence()) ?? null,

      movementTypeName: faker.word.noun(),
      movementTypeDirection: faker.helpers.arrayElement(['IN', 'OUT'] as const),

      userName: faker.person.fullName(),

      locationId: new UniqueEntityID().toString(),
      locationCode: faker.string.alphanumeric(4).toUpperCase(),
      locationName: faker.word.noun(),

      subLocationId: new UniqueEntityID().toString(),
      subLocationCode: faker.string.alphanumeric(4).toUpperCase(),
      subLocationName: faker.word.noun(),

      rowId: new UniqueEntityID().toString(),
      rowCode: faker.string.alphanumeric(4).toUpperCase(),
      rowName: faker.word.noun(),

      shelfId: new UniqueEntityID().toString(),
      shelfCode: faker.string.alphanumeric(4).toUpperCase(),
      shelfName: faker.word.noun(),

      positionId: new UniqueEntityID().toString(),
      positionCode: faker.string.alphanumeric(4).toUpperCase(),
      positionName: faker.word.noun(),

      materialId: new UniqueEntityID().toString(),
      materialCode: faker.string.alphanumeric(6).toUpperCase(),
      materialName: faker.commerce.productName(),
      materialDescription: faker.commerce.productDescription(),
      materialUnit: faker.helpers.arrayElement(['UN', 'KG', 'L', 'M', 'CX']),
      materialPhotoUrl: null,
      materialGroupId: new UniqueEntityID().toString(),
      materialGroupName: faker.word.noun(),

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
