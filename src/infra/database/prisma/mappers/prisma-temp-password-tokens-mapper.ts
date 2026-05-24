import {
  Prisma,
  TempPasswordToken as PrismaTempPasswordToken,
} from '@generated/prisma/client';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { TempPasswordToken } from '@/domain/user/enterprise/entities/temp-password-token';

export class PrismaTempPasswordTokensMapper {
  static toDomain(raw: PrismaTempPasswordToken): TempPasswordToken {
    return TempPasswordToken.create(
      {
        token: raw.token,
        expirationDate: raw.expirationDate,
        userId: new UniqueEntityID(raw.userId),
        companyId: new UniqueEntityID(raw.companyId),
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(
    tempPasswordToken: TempPasswordToken,
  ): Prisma.TempPasswordTokenUncheckedCreateInput {
    return {
      id: tempPasswordToken.id.toString(),
      token: tempPasswordToken.token,
      expirationDate: tempPasswordToken.expirationDate,
      userId: tempPasswordToken.userId.toString(),
      companyId: tempPasswordToken.companyId.toString(),
    };
  }
}
