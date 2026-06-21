import { Group as PrismaGroup, Prisma } from '@generated/prisma/client';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Group } from '@/domain/stock/enterprise/entities/group';

export class PrismaGroupMapper {
  static toDomain(raw: PrismaGroup): Group {
    return Group.create(
      {
        companyId: new UniqueEntityID(raw.companyId),
        code: raw.code,
        name: raw.name,
        description: raw.description,
        active: raw.active,
        photoUrl: raw.photoUrl ?? null,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(group: Group): Prisma.GroupUncheckedCreateInput {
    return {
      companyId: group.companyId.toString(),
      id: group.id.toString(),
      code: group.code,
      name: group.name,
      description: group.description,
      active: group.active,
      photoUrl: group.photoUrl ?? null,
    };
  }
}
