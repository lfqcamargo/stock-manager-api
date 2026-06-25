import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Shelf, ShelfProps } from '@/domain/stock/enterprise/entities/shelf';
import { PrismaShelfMapper } from '@/infra/database/prisma/mappers/prisma-shelf-mapper';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

export function makeShelf(
  override: Partial<ShelfProps> = {},
  id?: UniqueEntityID,
) {
  const shelf = Shelf.create(
    {
      companyId: new UniqueEntityID(faker.string.uuid()),
      code: faker.lorem.slug(2).toUpperCase(),
      name: faker.commerce.product(),
      description: faker.lorem.text(),
      ...override,
    },
    id,
  );

  return shelf;
}

@Injectable()
export class ShelfFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaShelf(data: Partial<ShelfProps> = {}): Promise<Shelf> {
    const shelf = makeShelf(data);

    await this.prisma.shelf.create({
      data: PrismaShelfMapper.toPrisma(shelf),
    });

    return shelf;
  }
}
