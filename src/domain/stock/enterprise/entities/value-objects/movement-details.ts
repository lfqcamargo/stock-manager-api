import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ValueObject } from '@/core/entities/value-object';
import { User } from '@/domain/user/enterprise/entities/user';

import { MovementType } from '../movement-type';
import { AddressingDetails } from './addressing-details';

export interface MovementDetailsProps {
  companyId: UniqueEntityID;
  id: UniqueEntityID;
  addressing: AddressingDetails;
  movementType: MovementType;
  user: User;
  quantity: number;
  date: Date;
  observation?: string | null;
}

export class MovementDetails extends ValueObject<MovementDetailsProps> {
  get companyId(): UniqueEntityID {
    return this.props.companyId;
  }

  get id(): UniqueEntityID {
    return this.props.id;
  }

  get addressing(): AddressingDetails {
    return this.props.addressing;
  }

  get movementType(): MovementType {
    return this.props.movementType;
  }

  get user(): User {
    return this.props.user;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get date(): Date {
    return this.props.date;
  }

  get observation(): string | null {
    return this.props.observation ?? null;
  }

  static create(props: MovementDetailsProps) {
    return new MovementDetails(props);
  }
}
