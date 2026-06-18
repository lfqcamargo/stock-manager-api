import { AggregateRoot } from '@/core/entities/aggregate-root';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

import { UnitMeasure } from './value-objects/unit-measure';

export interface MaterialProps {
  companyId: UniqueEntityID;
  groupId: UniqueEntityID;

  code: string;
  name: string;
  description?: string | null;
  unit: UnitMeasure;
  active: boolean;
}

export class Material extends AggregateRoot<MaterialProps> {
  get companyId() {
    return this.props.companyId;
  }

  get groupId() {
    return this.props.groupId;
  }

  set groupId(value: UniqueEntityID) {
    this.props.groupId = value;
  }

  get code() {
    return this.props.code;
  }

  set code(value: string) {
    this.props.code = value;
  }

  get name() {
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

  get unit() {
    return this.props.unit;
  }

  set unit(value: UnitMeasure) {
    this.props.unit = value;
  }

  get active() {
    return this.props.active;
  }

  set active(value: boolean) {
    this.props.active = value;
  }

  static create(props: MaterialProps, id?: UniqueEntityID) {
    return new Material(
      {
        ...props,
      },
      id,
    );
  }
}
