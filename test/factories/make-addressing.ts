import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  Addressing,
  AddressingProps,
} from '@/domain/stock/enterprise/entities/addressing';
import { PrismaAddressingMapper } from '@/infra/database/prisma/mappers/prisma-addressing-mapper';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

export function makeAddressing(
  override: Partial<AddressingProps> = {},
  id?: UniqueEntityID,
) {
  const addressing = Addressing.create(
    {
      companyId: new UniqueEntityID(faker.string.uuid()),
      locationId: new UniqueEntityID(faker.string.uuid()),
      subLocationId: new UniqueEntityID(faker.string.uuid()),
      rowId: new UniqueEntityID(faker.string.uuid()),
      shelfId: new UniqueEntityID(faker.string.uuid()),
      positionId: new UniqueEntityID(faker.string.uuid()),
      amount: faker.number.int({ min: 1, max: 100 }),
      active: true,
      ...override,
    },
    id,
  );

  return addressing;
}

@Injectable()
export class AddressingFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaAddressing(
    data: Partial<AddressingProps> = {},
  ): Promise<Addressing> {
    const addressing = makeAddressing(data);

    await this.prisma.addressing.create({
      data: PrismaAddressingMapper.toPrisma(addressing),
    });

    return addressing;
  }
}
