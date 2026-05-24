import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  Company,
  CompanyProps,
} from '@/domain/user/enterprise/entities/company';
import { PrismaCompanyMapper } from '@/infra/database/prisma/mappers/prisma-company-mapper';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

export function makeCompany(
  override: Partial<CompanyProps> = {},
  id?: UniqueEntityID,
) {
  const company = Company.create(
    {
      name: faker.company.name(),
      cnpj: faker.string.numeric(14),
      photo: faker.helpers.maybe(() => faker.image.url()),

      ...override,
    },
    id,
  );

  return company;
}

@Injectable()
export class CompanyFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaCompany(data: Partial<CompanyProps> = {}): Promise<Company> {
    const company = makeCompany(data);

    await this.prisma.company.create({
      data: PrismaCompanyMapper.toPrisma(company),
    });

    return company;
  }
}
