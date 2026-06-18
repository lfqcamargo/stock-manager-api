import { AggregateRoot } from '@/core/entities/aggregate-root';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';

export interface MovementProps {
  companyId: UniqueEntityID;
  addressingId: UniqueEntityID;
  movementTypeId: UniqueEntityID;
  userId: UniqueEntityID;
  quantity: number;
  date: Date;
  observation?: string | null;
  createdAt: Date;
}

export class Movement extends AggregateRoot<MovementProps> {
  get companyId(): UniqueEntityID {
    return this.props.companyId;
  }

  get addressingId(): UniqueEntityID {
    return this.props.addressingId;
  }

  set addressingId(value: UniqueEntityID) {
    this.props.addressingId = value;
  }

  get movementTypeId(): UniqueEntityID {
    return this.props.movementTypeId;
  }

  set movementTypeId(value: UniqueEntityID) {
    this.props.movementTypeId = value;
  }

  get userId(): UniqueEntityID {
    return this.props.userId;
  }

  set userId(value: UniqueEntityID) {
    this.props.userId = value;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  set quantity(value: number) {
    this.props.quantity = value;
  }

  get date(): Date {
    return this.props.date;
  }

  set date(value: Date) {
    this.props.date = value;
  }

  get observation(): string | null {
    return this.props.observation ?? null;
  }

  set observation(value: string | null) {
    this.props.observation = value;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  static create(
    props: Optional<MovementProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    return new Movement(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }
}
