import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { DomainEvent } from '@/core/events/domain-event';

import { TempCompany } from '../entities/temp-company';

export class TempCompanyCreatedEvent implements DomainEvent {
  public occurredAt: Date;

  constructor(public readonly tempCompany: TempCompany) {
    this.occurredAt = new Date();
  }

  getAggregateId(): UniqueEntityID {
    return this.tempCompany.id;
  }
}
