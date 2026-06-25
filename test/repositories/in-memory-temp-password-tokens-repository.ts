import { DomainEvents } from '@/core/events/domain-events';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { FetchAllFilterParams } from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import { TempPasswordTokensRepository } from '@/domain/user/application/repositories/temp-password-tokens-repository';
import { TempPasswordToken } from '@/domain/user/enterprise/entities/temp-password-token';

export class InMemoryTempPasswordTokensRepository implements TempPasswordTokensRepository {
  public items: TempPasswordToken[] = [];

  async create(
    data: TempPasswordToken,
    _options?: TransactionContextParams,
  ): Promise<void> {
    this.items.push(data);

    DomainEvents.dispatchEventsForAggregate(data.id);
    return Promise.resolve();
  }

  async findById(id: string): Promise<TempPasswordToken | null> {
    const passwordToken = this.items.find((item) => item.id.toString() === id);
    return Promise.resolve(passwordToken ?? null);
  }

  async findByToken(token: string): Promise<TempPasswordToken | null> {
    const passwordToken = this.items.find((item) => item.token === token);
    return Promise.resolve(passwordToken ?? null);
  }

  async fetchAll(
    _filter: FetchAllFilterParams,
    { page, itemsPerPage }: PaginationParams,
    _options?: TransactionContextParams,
  ): Promise<{ data: TempPasswordToken[]; meta: Record<string, any> }> {
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

  async deleteByToken(
    token: string,
    _options?: TransactionContextParams,
  ): Promise<void> {
    this.items = this.items.filter((item) => item.token !== token);
    return Promise.resolve();
  }

  async deleteByUserId(
    userId: string,
    _options?: TransactionContextParams,
  ): Promise<void> {
    this.items = this.items.filter((item) => item.userId.toString() !== userId);
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
