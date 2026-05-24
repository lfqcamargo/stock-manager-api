import {
  Prisma,
  TempCompany as PrismaTempCompany,
} from '@generated/prisma/client';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { TempCompany } from '@/domain/user/enterprise/entities/temp-company';

export class PrismaTempCompanyMapper {
  static toDomain(raw: PrismaTempCompany): TempCompany {
    return TempCompany.create(
      {
        companyName: raw.companyName,
        companyCnpj: raw.companyCnpj,
        userName: raw.userName,
        userEmail: raw.userEmail,
        userPassword: raw.userPassword,
        token: raw.token,
        expirationDate: raw.expirationDate,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(
    tempcompany: TempCompany,
  ): Prisma.TempCompanyUncheckedCreateInput {
    return {
      companyName: tempcompany.companyName,
      companyCnpj: tempcompany.companyCnpj,
      userName: tempcompany.userName,
      userEmail: tempcompany.userEmail,
      userPassword: tempcompany.userPassword,
      token: tempcompany.token,
      expirationDate: tempcompany.expirationDate,
    };
  }
}
