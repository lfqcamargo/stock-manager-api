import { Prisma, TempUser as PrismaTempUser } from '@generated/prisma/client';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { TempUser } from '@/domain/user/enterprise/entities/temp-user';
import { UserRole } from '@/domain/user/enterprise/entities/user';

export class PrismaTempUserMapper {
  static toDomain(raw: PrismaTempUser): TempUser {
    return TempUser.create(
      {
        name: raw.name,
        email: raw.email,
        password: raw.password,
        role: raw.role as UserRole,
        token: raw.token,
        expirationDate: raw.expirationDate,
        companyId: new UniqueEntityID(raw.companyId),
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(tempuser: TempUser): Prisma.TempUserUncheckedCreateInput {
    return {
      id: tempuser.id.toString(),
      name: tempuser.name,
      email: tempuser.email,
      password: tempuser.password,
      role: tempuser.role,
      token: tempuser.token,
      expirationDate: tempuser.expirationDate,
      companyId: tempuser.companyId.toString(),
    };
  }
}
