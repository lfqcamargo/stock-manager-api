import { DomainEvents } from '@/core/events/domain-events';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { FetchAllFilterParams } from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import { TempUsersRepository } from '@/domain/user/application/repositories/temp-users-repository';
import { TempUser } from '@/domain/user/enterprise/entities/temp-user';

export class InMemoryTempUsersRepository implements TempUsersRepository {
  public items: TempUser[] = [];

  async create(
    tempuser: TempUser,
    _options?: TransactionContextParams,
  ): Promise<void> {
    this.items.push(tempuser);

    DomainEvents.dispatchEventsForAggregate(tempuser.id);
    return Promise.resolve();
  }

  async findById(id: string): Promise<TempUser | null> {
    const tempuser = this.items.find((item) => item.id.toString() === id);
    return Promise.resolve(tempuser ?? null);
  }

  async findByEmail(email: string): Promise<TempUser | null> {
    const tempuser = this.items.find((item) => item.email === email);
    return Promise.resolve(tempuser ?? null);
  }

  async findByToken(token: string): Promise<TempUser | null> {
    const tempuser = this.items.find((item) => item.token === token);
    return Promise.resolve(tempuser ?? null);
  }

  async fetchAll(
    _filter: FetchAllFilterParams,
    { page, itemsPerPage }: PaginationParams,
    _options?: TransactionContextParams,
  ): Promise<{ data: TempUser[]; meta: Record<string, any> }> {
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
