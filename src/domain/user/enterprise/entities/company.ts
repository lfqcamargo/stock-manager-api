import { AggregateRoot } from '@/core/entities/aggregate-root';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';

import { ConfirmationCompanyCreatedEvent } from '../events/confirmation-company-created.event';
import { User } from './user';

export interface CompanyProps {
  name: string;
  cnpj: string;
  photo?: string | null;

  createdAt: Date;
  updatedAt: Date;

  users: User[];
}

export class Company extends AggregateRoot<CompanyProps> {
  get name(): string {
    return this.props.name;
  }

  get cnpj(): string {
    return this.props.cnpj;
  }

  get photo(): string | null | undefined {
    return this.props.photo;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  get users(): User[] {
    return this.props.users;
  }

  set users(users: User[]) {
    this.props.users = users;
  }

  public updateName(name: string): void {
    this.props.name = name;
    this.touch();
  }

  public updateCnpj(cnpj: string): void {
    this.props.cnpj = cnpj;
    this.touch();
  }

  public updatePhoto(photo: string | null): void {
    this.props.photo = photo;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  public static create(
    props: Optional<CompanyProps, 'createdAt' | 'updatedAt' | 'users'>,
    id?: UniqueEntityID,
  ): Company {
    const company = new Company(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
        users: props.users ?? [],
      },
      id,
    );

    if (!id)
      company.addDomainEvent(new ConfirmationCompanyCreatedEvent(company));

    return company;
  }
}
