import { PaginationParams } from 'src/core/repositories/pagination-params';

import { DomainEvents } from '@/core/events/domain-events';
import {
  FetchUsersFilterParams,
  UsersRepository,
} from '@/domain/user/application/repositories/users-repository';
import { User, UserRole } from '@/domain/user/enterprise/entities/user';

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = [];

  async create(user: User): Promise<void> {
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
      createdAt,
      lastLogin,
    }: FetchUsersFilterParams,
    { page, itemsPerPage }: PaginationParams,
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
    if (createdAt) {
      users = users.filter(
        (user) => user.createdAt.toDateString() === createdAt.toDateString(),
      );
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

  async update(user: User): Promise<void> {
    const userIndex = this.items.findIndex(
      (item) => item.id.toString() === user.id.toString(),
    );

    if (userIndex >= 0) {
      this.items[userIndex] = user;
    }

    return Promise.resolve();
  }

  async delete(user: User): Promise<void> {
    this.items = this.items.filter(
      (item) => item.id.toString() !== user.id.toString(),
    );
    DomainEvents.dispatchEventsForAggregate(user.id);
    return Promise.resolve();
  }
}
