import { AggregateRoot } from '@/core/entities/aggregate-root';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export interface AddressingProps {
  companyId: UniqueEntityID;
  locationId: UniqueEntityID;
  subLocationId: UniqueEntityID;
  rowId: UniqueEntityID;
  shelfId: UniqueEntityID;
  positionId: UniqueEntityID;

  materialId?: UniqueEntityID | null;
  amount: number;
  active: boolean;
}

export class Addressing extends AggregateRoot<AddressingProps> {
  get companyId(): UniqueEntityID {
    return this.props.companyId;
  }

  get locationId(): UniqueEntityID {
    return this.props.locationId;
  }

  get subLocationId(): UniqueEntityID {
    return this.props.subLocationId;
  }

  get rowId(): UniqueEntityID {
    return this.props.rowId;
  }

  get shelfId(): UniqueEntityID {
    return this.props.shelfId;
  }

  get positionId(): UniqueEntityID {
    return this.props.positionId;
  }

  get materialId(): UniqueEntityID | null {
    if (this.props.materialId) {
      return this.props.materialId;
    }
    return null;
  }

  set materialId(value: UniqueEntityID | null) {
    this.props.materialId = value;
  }

  get amount(): number {
    return this.props.amount;
  }

  set amount(value: number) {
    this.props.amount = value;
  }

  get active(): boolean {
    return this.props.active;
  }

  set active(value: boolean) {
    this.props.active = value;
  }

  static create(props: AddressingProps, id?: UniqueEntityID) {
    return new Addressing(
      {
        ...props,
        amount: props.amount ?? 0,
      },
      id,
    );
  }
}
