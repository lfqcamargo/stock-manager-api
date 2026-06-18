import { AggregateRoot } from '@/core/entities/aggregate-root';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export interface LocationProps {
  companyId: UniqueEntityID;

  name: string;
  code: string;
  description?: string | null;
}

export class Location extends AggregateRoot<LocationProps> {
  get companyId() {
    return this.props.companyId;
  }

  get name() {
    return this.props.name;
  }

  set name(value: string) {
    this.props.name = value;
  }

  get code(): string {
    return this.props.code;
  }

  set code(value: string) {
    this.props.code = value;
  }

  get description(): string | null {
    return this.props.description ?? null;
  }

  set description(value: string | undefined) {
    this.props.description = value;
  }

  static create(props: LocationProps, id?: UniqueEntityID) {
    return new Location(
      {
        ...props,
      },
      id,
    );
  }
}
