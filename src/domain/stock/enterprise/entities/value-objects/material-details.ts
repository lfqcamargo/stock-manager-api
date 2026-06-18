import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ValueObject } from '@/core/entities/value-object';

import { UnitMeasure } from './unit-measure';

export interface MaterialDetailsProps {
  companyId: UniqueEntityID;
  groupId: UniqueEntityID;
  group: string;
  id: UniqueEntityID;
  code: string;
  name: string;
  description?: string | null;
  unit: UnitMeasure;
  active: boolean;
}

export class MaterialDetails extends ValueObject<MaterialDetailsProps> {
  get companyId(): UniqueEntityID {
    return this.props.companyId;
  }

  get groupId(): UniqueEntityID {
    return this.props.groupId;
  }

  get group(): string {
    return this.props.group;
  }

  get id(): UniqueEntityID {
    return this.props.id;
  }

  get code(): string {
    return this.props.code;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null | undefined {
    return this.props.description;
  }

  get unit(): UnitMeasure {
    return this.props.unit;
  }

  get active(): boolean {
    return this.props.active;
  }

  static create(props: MaterialDetailsProps) {
    return new MaterialDetails(props);
  }
}
