import { DomainEvents } from '@/core/events/domain-events';
import { TempUsersRepository } from '@/domain/user/application/repositories/temp-users-repository';
import { TempUser } from '@/domain/user/enterprise/entities/temp-user';

export class InMemoryTempUsersRepository implements TempUsersRepository {
  public items: TempUser[] = [];

  async create(tempuser: TempUser): Promise<void> {
    this.items.push(tempuser);

    DomainEvents.dispatchEventsForAggregate(tempuser.id);
    return Promise.resolve();
  }

  async findByEmail(email: string): Promise<TempUser | null> {
    const tempuser = this.items.find((item) => item.email === email);
    return Promise.resolve(tempuser ?? null);
  }

  async findByToken(token: string): Promise<TempUser | null> {
    const tempuser = this.items.find((item) => item.token === token);
    return Promise.resolve(tempuser ?? null);
  }

  async delete(tempuser: TempUser): Promise<void> {
    this.items = this.items.filter((item) => item.id !== tempuser.id);
    return Promise.resolve();
  }
}
