import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { DomainEvent } from '@/core/events/domain-event';

import { User } from '../entities/user';

export class PasswordChangeEvent implements DomainEvent {
  public occurredAt: Date;

  constructor(public user: User) {
    this.occurredAt = new Date();
  }

  getAggregateId(): UniqueEntityID {
    return this.user.id;
  }
}
