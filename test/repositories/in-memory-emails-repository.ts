import { AggregateRoot } from '@/core/entities/aggregate-root';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { FetchAllFilterParams } from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import { EmailsRepository } from '@/domain/notification/application/repositories/emails-repository';
import { Email } from '@/domain/notification/enterprise/entities/email';

export class InMemoryEmailsRepository implements EmailsRepository {
  public items: Email[] = [];

  async create(
    email: Email,
    _options?: TransactionContextParams,
  ): Promise<void> {
    this.items.push(email);

    return Promise.resolve();
  }

  async findById(id: string): Promise<Email | null> {
    const email = this.items.find((item) => item.id.toString() === id);
    return Promise.resolve(email ?? null);
  }

  async fetchAll(
    _filter: FetchAllFilterParams,
    { page, itemsPerPage }: PaginationParams,
    _options?: TransactionContextParams,
  ): Promise<{ data: AggregateRoot<any>[]; meta: Record<string, any> }> {
    const totalItems = this.items.length;
    const paginated = this.items.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage,
    );

    return Promise.resolve({
      data: paginated as unknown as AggregateRoot<any>[],
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
