import { TempPasswordTokensRepository } from 'src/domain/user/application/repositories/temp-password-tokens-repository';
import { TempPasswordToken } from 'src/domain/user/enterprise/entities/temp-password-token';

import { DomainEvents } from '@/core/events/domain-events';

export class InMemoryTempPasswordTokensRepository implements TempPasswordTokensRepository {
  public items: TempPasswordToken[] = [];

  async create(data: TempPasswordToken): Promise<void> {
    this.items.push(data);

    DomainEvents.dispatchEventsForAggregate(data.id);
    return Promise.resolve();
  }

  async findByToken(token: string): Promise<TempPasswordToken | null> {
    const passwordToken = this.items.find((item) => item.token === token);
    return Promise.resolve(passwordToken ?? null);
  }

  async deleteByToken(token: string): Promise<void> {
    this.items = this.items.filter((item) => item.token !== token);
    return Promise.resolve();
  }

  async deleteByUserId(userId: string): Promise<void> {
    this.items = this.items.filter((item) => item.userId.toString() !== userId);
    return Promise.resolve();
  }
}
