import { DomainEvents } from '@/core/events/domain-events';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { FetchAllFilterParams } from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import { CompaniesRepository } from '@/domain/user/application/repositories/companies-repository';
import { Company } from '@/domain/user/enterprise/entities/company';

export class InMemoryCompaniesRepository implements CompaniesRepository {
  public items: Company[] = [];

  async create(
    company: Company,
    _options?: TransactionContextParams,
  ): Promise<void> {
    this.items.push(company);

    DomainEvents.dispatchEventsForAggregate(company.id);
    return Promise.resolve();
  }

  async findById(id: string): Promise<Company | null> {
    const company = this.items.find((item) => item.id.toString() === id);
    return Promise.resolve(company ?? null);
  }

  async findByCnpj(cnpj: string): Promise<Company | null> {
    const company = this.items.find((item) => item.cnpj === cnpj);
    return Promise.resolve(company ?? null);
  }

  async fetchAll(
    _filter: FetchAllFilterParams,
    { page, itemsPerPage }: PaginationParams,
    _options?: TransactionContextParams,
  ): Promise<{ data: Company[]; meta: Record<string, any> }> {
    const totalItems = this.items.length;
    const paginated = this.items.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage,
    );

    return Promise.resolve({
      data: paginated,
      meta: {
        totalItems,
        itemCount: paginated.length,
        itemsPerPage,
        totalPages: Math.ceil(totalItems / itemsPerPage),
        currentPage: page,
      },
    });
  }

  async update(
    company: Company,
    _options?: TransactionContextParams,
  ): Promise<void> {
    const companyIndex = this.items.findIndex(
      (item) => item.id.toString() === company.id.toString(),
    );

    if (companyIndex >= 0) {
      this.items[companyIndex] = company;
    }

    DomainEvents.dispatchEventsForAggregate(company.id);

    return Promise.resolve();
  }

  async delete(id: string, _options?: TransactionContextParams): Promise<void> {
    this.items = this.items.filter((item) => item.id.toString() !== id);
    return Promise.resolve();
  }

  async deleteMany(
    _filters: FetchAllFilterParams,
    _options?: TransactionContextParams,
  ): Promise<void> {
    this.items = [];
    return Promise.resolve();
  }
}
