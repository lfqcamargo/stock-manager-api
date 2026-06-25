import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  Location,
  LocationProps,
} from '@/domain/stock/enterprise/entities/location';
import { PrismaLocationMapper } from '@/infra/database/prisma/mappers/prisma-location-mapper';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

export function makeLocation(
  override: Partial<LocationProps> = {},
  id?: UniqueEntityID,
) {
  const location = Location.create(
    {
      companyId: new UniqueEntityID(faker.string.uuid()),
      code: faker.lorem.slug(2).toUpperCase(),
      name: faker.commerce.department(),
      description: faker.lorem.text(),
      ...override,
    },
    id,
  );

  return location;
}

@Injectable()
export class LocationFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaLocation(data: Partial<LocationProps> = {}): Promise<Location> {
    const location = makeLocation(data);

    await this.prisma.location.create({
      data: PrismaLocationMapper.toPrisma(location),
    });

    return location;
  }
}
