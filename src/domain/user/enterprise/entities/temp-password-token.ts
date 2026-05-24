import { AggregateRoot } from '@/core/entities/aggregate-root';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';

import { TempPasswordTokenCreatedEvent } from '../events/temp-password-token-created.event';

export interface TempPasswordTokenProps {
  token: string;
  expirationDate: Date;

  userId: UniqueEntityID;
  companyId: UniqueEntityID;
}

export class TempPasswordToken extends AggregateRoot<TempPasswordTokenProps> {
  get token(): string {
    return this.props.token;
  }

  get expirationDate(): Date {
    return this.props.expirationDate;
  }

  get userId(): UniqueEntityID {
    return this.props.userId;
  }

  get companyId(): UniqueEntityID {
    return this.props.companyId;
  }

  static create(
    props: Optional<TempPasswordTokenProps, 'token' | 'expirationDate'>,
    id?: UniqueEntityID,
  ) {
    const tempPasswordToken = new TempPasswordToken(
      {
        ...props,
        token: props.token ?? new UniqueEntityID().toString(),
        expirationDate:
          props.expirationDate ?? new Date(Date.now() + 1000 * 60 * 60), // 1 hour
      },
      id,
    );

    if (!id)
      tempPasswordToken.addDomainEvent(
        new TempPasswordTokenCreatedEvent(
          tempPasswordToken,
          props.userId.toString(),
        ),
      );

    return tempPasswordToken;
  }
}
