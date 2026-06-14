import { AggregateRoot } from '@/core/entities/aggregate-root';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { DomainEvents } from '@/core/events/domain-events';
import { Optional } from '@/core/types/optional';

import { PasswordChangeEvent } from '../events/password-change.event';
import { UpdateLastLoginUserEvent } from '../events/update-last-login-user.event';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

export interface UserProps {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
  photo?: string | null;

  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date | null;

  companyId: UniqueEntityID;
}

export class User extends AggregateRoot<UserProps> {
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

  get isActive(): boolean {
    return this.props.active;
  }

  get photo(): string | null | undefined {
    return this.props.photo;
  }

  get companyId(): UniqueEntityID {
    return this.props.companyId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get lastLogin(): Date | null | undefined {
    return this.props.lastLogin;
  }

  public updateName(name: string): void {
    this.props.name = name;
    this.touch();
  }

  public updateEmail(email: string): void {
    this.props.email = email;
    this.touch();
  }

  public updatePassword(password: string): void {
    this.props.password = password;
    this.addDomainEvent(new PasswordChangeEvent(this));
    this.touch();
  }

  public changeRole(role: UserRole): void {
    this.props.role = role;
    this.touch();
  }

  public activate(): void {
    this.props.active = true;
    this.touch();
  }

  public deactivate(): void {
    this.props.active = false;
    this.touch();
  }

  public updatePhoto(photo: string | null): void {
    this.props.photo = photo;
    this.touch();
  }

  public touch(): void {
    this.props.updatedAt = new Date();
  }

  public updateLastLoginAt(): void {
    this.props.lastLogin = new Date();
    this.touch();
  }

  public updateLastLogin(): void {
    this.addDomainEvent(new UpdateLastLoginUserEvent(this));
    DomainEvents.dispatchEventsForAggregate(this.id);
  }

  public isAdmin(): boolean {
    return this.props.role === UserRole.ADMIN;
  }

  public static create(
    props: Optional<UserProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
  ): User {
    const user = new User(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );

    return user;
  }
}
