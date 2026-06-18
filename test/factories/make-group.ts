import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Group, GroupProps } from '@/domain/stock/enterprise/entities/group';
import { PrismaGroupMapper } from '@/infra/database/prisma/mappers/prisma-group-mapper';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

export function makeGroup(
  override: Partial<GroupProps> = {},
  id?: UniqueEntityID,
) {
  const group = Group.create(
    {
      companyId: new UniqueEntityID(faker.string.uuid()),
      code: faker.lorem.slug(3),
      name: faker.commerce.product(),
      active: faker.datatype.boolean(),
      description: faker.lorem.text(),
      ...override,
    },
    id,
  );

  return group;
}

@Injectable()
export class GroupFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaGroup(data: Partial<GroupProps> = {}): Promise<Group> {
    const group = makeGroup(data);

    await this.prisma.group.create({
      data: PrismaGroupMapper.toPrisma(group),
    });

    return group;
  }
}
