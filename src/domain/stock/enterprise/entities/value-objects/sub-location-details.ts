import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ValueObject } from '@/core/entities/value-object';

import { Location } from '../location';

export interface SubLocationDetailsProps {
  id: UniqueEntityID;
  companyId: UniqueEntityID;
  location: Location;
  code: string;
  name: string;
  description?: string | null;
}

export class SubLocationDetails extends ValueObject<SubLocationDetailsProps> {
  get id(): UniqueEntityID {
    return this.props.id;
  }

  get companyId(): UniqueEntityID {
    return this.props.companyId;
  }
  get location(): Location {
    return this.props.location;
  }

  get code(): string {
    return this.props.code;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null | void {
    return this.props.description;
  }

  static create(props: SubLocationDetailsProps) {
    return new SubLocationDetails(props);
  }
}
