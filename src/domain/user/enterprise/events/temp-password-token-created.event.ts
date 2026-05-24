import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { DomainEvent } from '@/core/events/domain-event';

import { TempPasswordToken } from '../entities/temp-password-token';

export class TempPasswordTokenCreatedEvent implements DomainEvent {
  public occurredAt: Date;

  constructor(
    public tempPasswordToken: TempPasswordToken,
    public userId: string,
  ) {
    this.occurredAt = new Date();
  }

  getAggregateId(): UniqueEntityID {
    return this.tempPasswordToken.id;
  }
}
