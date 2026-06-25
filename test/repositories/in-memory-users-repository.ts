import { DomainEvents } from '@/core/events/domain-events';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import {
  FetchUsersFilterParams,
  UsersRepository,
} from '@/domain/user/application/repositories/users-repository';
import { User, UserRole } from '@/domain/user/enterprise/entities/user';

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = [];

  async create(user: User, _options?: TransactionContextParams): Promise<void> {
    this.items.push(user);

    return Promise.resolve();
  }

  async findById(id: string): Promise<User | null> {
    const user = this.items.find((item) => item.id.toString() === id);
    return Promise.resolve(user ?? null);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.items.find((item) => item.email === email);
    return Promise.resolve(user ?? null);
  }

  async fetchAll(
    {
      companyId,
      email,
      name,
      role,
      active,
      createdAtStart,
      createdAtEnd,
      lastLogin,
    }: FetchUsersFilterParams,
    { page, itemsPerPage }: PaginationParams,
    _options?: TransactionContextParams,
  ): Promise<{
    data: User[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
      totalAdmin: number;
      totalMaanger: number;
      totalEmployee: number;
      totalActive: number;
      totalInactive: number;
      lastCreated: Date;
    };
  }> {
    let users = this.items.filter(
      (item) => item.companyId.toString() === companyId,
    );

    if (email) {
      users = users.filter((user) =>
        user.email.toLowerCase().includes(email.toLowerCase()),
      );
    }

    if (name) {
      users = users.filter((user) =>
        user.name.toLowerCase().includes(name.toLowerCase()),
      );
    }
    if (role !== undefined) {
      users = users.filter((user) => user.role === role);
    }
    if (active !== undefined) {
      users = users.filter((user) => user.isActive === active);
    }
    if (createdAtStart) {
      users = users.filter((user) => user.createdAt >= createdAtStart);
    }
    if (createdAtEnd) {
      users = users.filter((user) => user.createdAt <= createdAtEnd);
    }
    if (lastLogin) {
      users = users.filter(
        (user) => user.lastLogin?.toDateString() === lastLogin.toDateString(),
      );
    }

    const totalItems = users.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentPage = page;

    const paginatedUsers = users.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage,
    );

    const totalActive = users.filter((user) => user.isActive).length;
    const totalInactive = totalItems - totalActive;

    const totalAdmin = users.filter(
      (user) => user.role === UserRole.ADMIN,
    ).length;
    const totalMaanger = users.filter(
      (user) => user.role === UserRole.MANAGER,
    ).length;
    const totalEmployee = users.filter(
      (user) => user.role === UserRole.EMPLOYEE,
    ).length;

    const lastCreatedUser = users.reduce((latest, user) => {
      const userDate = new Date(user.createdAt);
      return userDate > latest ? userDate : latest;
    }, new Date(users[0].createdAt));

    return Promise.resolve({
      data: paginatedUsers,
      meta: {
        totalItems,
        itemCount: paginatedUsers.length,
        itemsPerPage,
        totalPages,
        currentPage,
        totalAdmin,
        totalMaanger,
        totalEmployee,
        totalActive,
        totalInactive,
        lastCreated: lastCreatedUser,
      },
    });
  }

  async update(user: User, _options?: TransactionContextParams): Promise<void> {
    const userIndex = this.items.findIndex(
      (item) => item.id.toString() === user.id.toString(),
    );

    if (userIndex >= 0) {
      this.items[userIndex] = user;
    }

    return Promise.resolve();
  }

  async delete(id: string, _options?: TransactionContextParams): Promise<void> {
    const user = await this.findById(id);

    this.items = this.items.filter((item) => item.id.toString() !== id);

    if (user) {
      DomainEvents.dispatchEventsForAggregate(user.id);
    }

    return Promise.resolve();
  }

  async deleteMany(
    filters: FetchUsersFilterParams,
    _options?: TransactionContextParams,
  ): Promise<void> {
    this.items = this.items.filter((item) => {
      if (filters.companyId && item.companyId.toString() !== filters.companyId)
        return true;
      if (
        filters.email &&
        !item.email.toLowerCase().includes(filters.email.toLowerCase())
      )
        return true;
      if (
        filters.name &&
        !item.name.toLowerCase().includes(filters.name.toLowerCase())
      )
        return true;
      if (filters.role !== undefined && item.role !== filters.role) return true;
      if (filters.active !== undefined && item.isActive !== filters.active)
        return true;

      return false;
    });

    return Promise.resolve();
  }
}
