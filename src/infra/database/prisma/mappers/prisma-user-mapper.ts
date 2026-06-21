import { Prisma, User as PrismaUser } from '@generated/prisma/client';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { User, UserRole } from '@/domain/user/enterprise/entities/user';

export class PrismaUserMapper {
  static toDomain(raw: PrismaUser): User {
    return User.create(
      {
        name: raw.name,
        email: raw.email,
        password: raw.password,
        role: raw.role as UserRole,
        active: raw.active,
        photoUrl: raw.photoUrl ?? null,

        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        lastLogin: raw.lastLogin ?? null,

        companyId: new UniqueEntityID(raw.companyId),
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(user: User): Prisma.UserUncheckedCreateInput {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      active: user.isActive,
      photoUrl: user.photoUrl ?? null,

      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin ?? null,

      companyId: user.companyId.toString(),
    };
  }
}
