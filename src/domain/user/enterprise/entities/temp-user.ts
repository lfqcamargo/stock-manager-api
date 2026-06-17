import { AggregateRoot } from '@/core/entities/aggregate-root';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';

import { TempUserCreatedEvent } from '../events/temp-user-created.event';
import { UserRole } from './user';

export interface TempUserProps {
  name: string;
  email: string;
  password: string;
  role: UserRole;

  token: string;
  expirationDate: Date;

  companyId: UniqueEntityID;
}

export class TempUser extends AggregateRoot<TempUserProps> {
  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get password(): string {
    return this.props.password;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get companyId(): UniqueEntityID {
    return this.props.companyId;
  }

  get token(): string {
    return this.props.token;
  }

  get expirationDate(): Date {
    return this.props.expirationDate;
  }

  get expiration(): Date {
    return this.props.expirationDate;
  }

  get userRole(): UserRole {
    return this.props.role;
  }

  public static create(
    props: Optional<TempUserProps, 'token' | 'expirationDate'>,
    id?: UniqueEntityID,
  ): TempUser {
    const tempUser = new TempUser(
      {
        ...props,
        token: props.token ?? new UniqueEntityID().toString(),
        expirationDate:
          props.expirationDate ?? new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
      },
      id,
    );

    if (!id) tempUser.addDomainEvent(new TempUserCreatedEvent(tempUser));

    return tempUser;
  }
}
