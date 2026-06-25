import { Injectable } from '@nestjs/common';

import { DomainEvents } from '@/core/events/domain-events';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { FetchAllFilterParams } from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import { TempCompaniesRepository } from '@/domain/user/application/repositories/temp-companies-repository';
import { TempCompany } from '@/domain/user/enterprise/entities/temp-company';

import { PrismaTempCompanyMapper } from '../mappers/prisma-temp-company-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaTempCompaniesRepository implements TempCompaniesRepository {
  constructor(private readonly _prisma: PrismaService) {}

  async create(
    tempcompany: TempCompany,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this._prisma.tempCompany.create({
      data: PrismaTempCompanyMapper.toPrisma(tempcompany),
    });

    DomainEvents.dispatchEventsForAggregate(tempcompany.id);
  }

  async findById(id: string): Promise<TempCompany | null> {
    const tempcompany = await this._prisma.tempCompany.findUnique({
      where: { id },
    });
    return tempcompany ? PrismaTempCompanyMapper.toDomain(tempcompany) : null;
  }

  async findByCnpj(companyCnpj: string): Promise<TempCompany | null> {
    const tempcompany = await this._prisma.tempCompany.findUnique({
      where: { companyCnpj },
    });
    return tempcompany ? PrismaTempCompanyMapper.toDomain(tempcompany) : null;
  }

  async findByEmail(userEmail: string): Promise<TempCompany | null> {
    const tempcompany = await this._prisma.tempCompany.findUnique({
      where: { userEmail },
    });
    return tempcompany ? PrismaTempCompanyMapper.toDomain(tempcompany) : null;
  }

  async findByToken(token: string): Promise<TempCompany | null> {
    const tempcompany = await this._prisma.tempCompany.findUnique({
      where: { token },
    });
    return tempcompany ? PrismaTempCompanyMapper.toDomain(tempcompany) : null;
  }

  async fetchAll(
    _filter: FetchAllFilterParams,
    { page, itemsPerPage }: PaginationParams,
    _options?: TransactionContextParams,
  ): Promise<{ data: TempCompany[]; meta: Record<string, any> }> {
    const [totalItems, tempCompanies] = await Promise.all([
      this._prisma.tempCompany.count(),
      this._prisma.tempCompany.findMany({
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: { expirationDate: 'desc' },
      }),
    ]);

    return {
      data: tempCompanies.map((tempcompany) =>
        PrismaTempCompanyMapper.toDomain(tempcompany),
      ),
      meta: {
        totalItems,
        itemCount: tempCompanies.length,
        itemsPerPage,
        totalPages: Math.ceil(totalItems / itemsPerPage),
        currentPage: page,
      },
    };
  }

  async delete(id: string, _options?: TransactionContextParams): Promise<void> {
    await this._prisma.tempCompany.delete({ where: { id } });
  }

  async deleteMany(
    _filters: FetchAllFilterParams,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this._prisma.tempCompany.deleteMany();
  }
}
