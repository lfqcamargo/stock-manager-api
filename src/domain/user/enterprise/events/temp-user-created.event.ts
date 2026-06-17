import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { DomainEvent } from '@/core/events/domain-event';

import { TempUser } from '../entities/temp-user';

export class TempUserCreatedEvent implements DomainEvent {
  public occurredAt: Date;

  constructor(public readonly tempUser: TempUser) {
    this.occurredAt = new Date();
  }

  getAggregateId(): UniqueEntityID {
    return this.tempUser.id;
  }
}
