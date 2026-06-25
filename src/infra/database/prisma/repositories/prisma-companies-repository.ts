import { Injectable } from '@nestjs/common';

import { DomainEvents } from '@/core/events/domain-events';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { FetchAllFilterParams } from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import { CompaniesRepository } from '@/domain/user/application/repositories/companies-repository';
import { Company } from '@/domain/user/enterprise/entities/company';

import { PrismaCompanyMapper } from '../mappers/prisma-company-mapper';
import { PrismaUserMapper } from '../mappers/prisma-user-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaCompaniesRepository implements CompaniesRepository {
  constructor(private readonly _prisma: PrismaService) {}

  async create(
    company: Company,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this._prisma.$transaction(async (tx) => {
      await tx.company.create({
        data: PrismaCompanyMapper.toPrisma(company),
      });

      for (const user of company.users) {
        await tx.user.create({
          data: PrismaUserMapper.toPrisma(user),
        });
      }
    });

    DomainEvents.dispatchEventsForAggregate(company.id);
  }

  async findById(id: string): Promise<Company | null> {
    const company = await this._prisma.company.findUnique({
      where: { id },
    });
    return company ? PrismaCompanyMapper.toDomain(company) : null;
  }

  async findByCnpj(cnpj: string): Promise<Company | null> {
    const company = await this._prisma.company.findUnique({
      where: { cnpj },
    });
    return company ? PrismaCompanyMapper.toDomain(company) : null;
  }

  async fetchAll(
    _filter: FetchAllFilterParams,
    { page, itemsPerPage }: PaginationParams,
    _options?: TransactionContextParams,
  ): Promise<{ data: Company[]; meta: Record<string, any> }> {
    const [totalItems, companies] = await Promise.all([
      this._prisma.company.count(),
      this._prisma.company.findMany({
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      data: companies.map((company) => PrismaCompanyMapper.toDomain(company)),
      meta: {
        totalItems,
        itemCount: companies.length,
        itemsPerPage,
        totalPages: Math.ceil(totalItems / itemsPerPage),
        currentPage: page,
      },
    };
  }

  async update(
    company: Company,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this._prisma.company.update({
      where: { id: company.id.toString() },
      data: PrismaCompanyMapper.toPrisma(company),
    });
  }

  async delete(id: string, _options?: TransactionContextParams): Promise<void> {
    await this._prisma.company.delete({ where: { id } });
  }

  async deleteMany(
    _filters: FetchAllFilterParams,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this._prisma.company.deleteMany();
  }
}
