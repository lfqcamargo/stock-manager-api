import { AggregateRoot } from '@/core/entities/aggregate-root';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

import { Location } from '../location';
import { Material } from '../material';
import { Position } from '../position';
import { Row } from '../row';
import { Shelf } from '../shelf';
import { SubLocation } from '../sub-location';

export interface AddressingDetailsProps {
  companyId: UniqueEntityID;
  id: UniqueEntityID;
  location: Location;
  subLocation: SubLocation;
  row: Row;
  shelf: Shelf;
  position: Position;
  material: Material | null;

  amount: number;
  active: boolean;
}

export class AddressingDetails extends AggregateRoot<AddressingDetailsProps> {
  get companyId(): UniqueEntityID {
    return this.props.companyId;
  }

  get id(): UniqueEntityID {
    return this.props.id;
  }

  get location(): Location {
    return this.props.location;
  }

  get subLocation(): SubLocation {
    return this.props.subLocation;
  }

  get row(): Row {
    return this.props.row;
  }

  get shelf(): Shelf {
    return this.props.shelf;
  }

  get position(): Position {
    return this.props.position;
  }

  get material(): Material | null {
    return this.props.material;
  }

  get amount(): number {
    return this.props.amount;
  }

  get active(): boolean {
    return this.props.active;
  }

  static create(props: AddressingDetailsProps) {
    return new AddressingDetails(props);
  }
}
