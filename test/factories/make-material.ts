import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  Material,
  MaterialProps,
} from '@/domain/stock/enterprise/entities/material';
import { UnitMeasure } from '@/domain/stock/enterprise/entities/value-objects/unit-measure';
import { PrismaMaterialMapper } from '@/infra/database/prisma/mappers/prisma-material-mapper';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

export function makeMaterial(
  override: Partial<MaterialProps> = {},
  id?: UniqueEntityID,
) {
  const material = Material.create(
    {
      companyId: new UniqueEntityID(faker.string.uuid()),
      groupId: new UniqueEntityID(faker.string.uuid()),
      code: faker.lorem.slug(4),
      name: faker.commerce.product(),
      description: faker.lorem.text(),
      unit: UnitMeasure.fromCode(
        faker.helpers.arrayElement(['UN', 'KG', 'M', 'M2', 'CX']),
      ),
      active: faker.datatype.boolean(),
      ...override,
    },
    id,
  );

  return material;
}

@Injectable()
export class MaterialFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaMaterial(
    data: Partial<MaterialProps> = {},
  ): Promise<Material> {
    const material = makeMaterial(data);

    await this.prisma.material.create({
      data: PrismaMaterialMapper.toPrisma(material),
    });

    return material;
  }
}
