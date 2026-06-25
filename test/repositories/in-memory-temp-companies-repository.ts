import { DomainEvents } from '@/core/events/domain-events';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { FetchAllFilterParams } from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import { TempCompaniesRepository } from '@/domain/user/application/repositories/temp-companies-repository';
import { TempCompany } from '@/domain/user/enterprise/entities/temp-company';

export class InMemoryTempCompaniesRepository implements TempCompaniesRepository {
  public items: TempCompany[] = [];

  async create(
    tempcompany: TempCompany,
    _options?: TransactionContextParams,
  ): Promise<void> {
    this.items.push(tempcompany);

    DomainEvents.dispatchEventsForAggregate(tempcompany.id);
    return Promise.resolve();
  }

  async findById(id: string): Promise<TempCompany | null> {
    const tempcompany = this.items.find((item) => item.id.toString() === id);
    return Promise.resolve(tempcompany ?? null);
  }

  async findByCnpj(companyCnpj: string): Promise<TempCompany | null> {
    const tempcompany = this.items.find(
      (item) => item.companyCnpj === companyCnpj,
    );
    return Promise.resolve(tempcompany ?? null);
  }

  async findByEmail(userEmail: string): Promise<TempCompany | null> {
    const tempcompany = this.items.find((item) => item.userEmail === userEmail);
    return Promise.resolve(tempcompany ?? null);
  }

  async findByToken(token: string): Promise<TempCompany | null> {
    const tempcompany = this.items.find((item) => item.token === token);
    return Promise.resolve(tempcompany ?? null);
  }

  async fetchAll(
    _filter: FetchAllFilterParams,
    { page, itemsPerPage }: PaginationParams,
    _options?: TransactionContextParams,
  ): Promise<{ data: TempCompany[]; meta: Record<string, any> }> {
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
