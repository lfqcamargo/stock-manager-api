import { AggregateRoot } from '@/core/entities/aggregate-root';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export interface GroupProps {
  companyId: UniqueEntityID;

  code: string;
  name: string;
  description?: string | null;
  active: boolean;
  photoUrl?: string | null;
}

export class Group extends AggregateRoot<GroupProps> {
  get companyId(): UniqueEntityID {
    return this.props.companyId;
  }

  get code(): string {
    return this.props.code;
  }

  set code(value: string) {
    this.props.code = value;
  }

  get name(): string {
    return this.props.name;
  }

  set name(value: string) {
    this.props.name = value;
  }

  get description(): string | null {
    return this.props.description ?? null;
  }

  set description(value: string | null) {
    this.props.description = value;
  }

  get active(): boolean {
    return this.props.active;
  }

  set active(value: boolean) {
    this.props.active = value;
  }

  get photoUrl(): string | null | undefined {
    return this.props.photoUrl;
  }

  set photoUrl(value: string | null | undefined) {
    this.props.photoUrl = value;
  }

  static create(props: GroupProps, id?: UniqueEntityID) {
    return new Group(
      {
        ...props,
      },
      id,
    );
  }
}
