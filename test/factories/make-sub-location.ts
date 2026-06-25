import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  SubLocation,
  SubLocationProps,
} from '@/domain/stock/enterprise/entities/sub-location';
import { PrismaSubLocationMapper } from '@/infra/database/prisma/mappers/prisma-sub-location-mapper';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

export function makeSubLocation(
  override: Partial<SubLocationProps> = {},
  id?: UniqueEntityID,
) {
  const sublocation = SubLocation.create(
    {
      companyId: new UniqueEntityID(faker.string.uuid()),
      locationId: new UniqueEntityID(faker.string.uuid()),
      code: faker.lorem.slug(2).toUpperCase(),
      name: faker.commerce.product(),
      description: faker.lorem.text(),
      ...override,
    },
    id,
  );

  return sublocation;
}

@Injectable()
export class SubLocationFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaSubLocation(
    data: Partial<SubLocationProps> = {},
  ): Promise<SubLocation> {
    const subLocation = makeSubLocation(data);

    await this.prisma.subLocation.create({
      data: PrismaSubLocationMapper.toPrisma(subLocation),
    });

    return subLocation;
  }
}
