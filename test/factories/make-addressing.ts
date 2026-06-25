import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  Addressing,
  AddressingProps,
} from '@/domain/stock/enterprise/entities/addressing';

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
  // We can add prisma methods later if needed
}
