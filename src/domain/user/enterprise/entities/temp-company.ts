import { AggregateRoot } from '@/core/entities/aggregate-root';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';

import { TempCompanyCreatedEvent } from '../events/temp-company-created.event';

export interface TempCompanyProps {
  companyName: string;
  companyCnpj: string;

  userName: string;
  userEmail: string;
  userPassword: string;

  token: string;
  expirationDate: Date;
}

export class TempCompany extends AggregateRoot<TempCompanyProps> {
  get companyName(): string {
    return this.props.companyName;
  }

  get companyCnpj(): string {
    return this.props.companyCnpj;
  }

  get userName(): string {
    return this.props.userName;
  }

  get userEmail(): string {
    return this.props.userEmail;
  }

  get userPassword(): string {
    return this.props.userPassword;
  }

  get token(): string {
    return this.props.token;
  }

  get expirationDate(): Date {
    return this.props.expirationDate;
  }

  public static create(
    props: Optional<TempCompanyProps, 'token' | 'expirationDate'>,
    id?: UniqueEntityID,
  ): TempCompany {
    const tempCompany = new TempCompany(
      {
        ...props,
        token: props.token ?? new UniqueEntityID().toString(),
        expirationDate:
          props.expirationDate ?? new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
      },
      id,
    );

    if (!id)
      tempCompany.addDomainEvent(new TempCompanyCreatedEvent(tempCompany));

    return tempCompany;
  }
}
