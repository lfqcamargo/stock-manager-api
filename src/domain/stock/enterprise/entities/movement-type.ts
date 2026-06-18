import { AggregateRoot } from '@/core/entities/aggregate-root';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export enum MovementDirection {
  IN = 'IN',
  OUT = 'OUT',
}

export interface MovementTypeProps {
  companyId: UniqueEntityID;
  name: string;
  direction: MovementDirection;
}

export class MovementType extends AggregateRoot<MovementTypeProps> {
  get companyId(): UniqueEntityID {
    return this.props.companyId;
  }

  get name(): string {
    return this.props.name;
  }

  set name(value: string) {
    this.props.name = value;
  }

  get direction(): MovementDirection {
    return this.props.direction;
  }

  set direction(value: MovementDirection) {
    this.props.direction = value;
  }

  static create(props: MovementTypeProps, id?: UniqueEntityID) {
    return new MovementType(
      {
        ...props,
      },
      id,
    );
  }
}
