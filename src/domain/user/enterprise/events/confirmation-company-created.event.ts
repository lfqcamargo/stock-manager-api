import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { DomainEvent } from '@/core/events/domain-event';

import { Company } from '../entities/company';

export class ConfirmationCompanyCreatedEvent implements DomainEvent {
  public occurredAt: Date;

  constructor(public readonly company: Company) {
    this.occurredAt = new Date();
  }

  getAggregateId(): UniqueEntityID {
    return this.company.id;
  }
}
