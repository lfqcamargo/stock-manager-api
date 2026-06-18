import { AggregateRoot } from '@/core/entities/aggregate-root';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export interface SubLocationProps {
  companyId: UniqueEntityID;
  locationId: UniqueEntityID;

  name: string;
  code: string;
  description?: string | null;
}

export class SubLocation extends AggregateRoot<SubLocationProps> {
  get companyId() {
    return this.props.companyId;
  }

  get locationId() {
    return this.props.locationId;
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

  set description(value: string | null) {
    this.props.description = value;
  }

  static create(props: SubLocationProps, id?: UniqueEntityID) {
    return new SubLocation(
      {
        ...props,
      },
      id,
    );
  }
}
