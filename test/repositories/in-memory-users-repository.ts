import { DomainEvents } from '@/core/events/domain-events';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { User } from '@/domain/user/enterprise/entities/user';

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = [];

  async create(user: User): Promise<void> {
    this.items.push(user);

    DomainEvents.dispatchEventsForAggregate(user.id);
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

  async update(user: User): Promise<void> {
    const userIndex = this.items.findIndex(
      (item) => item.id.toString() === user.id.toString(),
    );

    if (userIndex >= 0) {
      this.items[userIndex] = user;
    }

    DomainEvents.dispatchEventsForAggregate(user.id);

    return Promise.resolve();
  }
}
