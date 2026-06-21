import { Company as PrismaCompany, Prisma } from '@generated/prisma/client';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Company } from '@/domain/user/enterprise/entities/company';

export class PrismaCompanyMapper {
  static toDomain(raw: PrismaCompany): Company {
    return Company.create(
      {
        cnpj: raw.cnpj,
        name: raw.name,
        photoUrl: raw.photoUrl ?? null,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(company: Company): Prisma.CompanyUncheckedCreateInput {
    return {
      id: company.id.toString(),
      cnpj: company.cnpj,
      name: company.name,
      photoUrl: company.photoUrl ?? null,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }
}
