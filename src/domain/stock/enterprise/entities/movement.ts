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

  movementTypeName: string;
  movementTypeDirection: 'IN' | 'OUT';

  userName: string;

  locationId: string;
  locationCode: string;
  locationName: string;

  subLocationId: string;
  subLocationCode: string;
  subLocationName: string;

  rowId: string;
  rowCode: string;
  rowName: string;

  shelfId: string;
  shelfCode: string;
  shelfName: string;

  positionId: string;
  positionCode: string;
  positionName: string;

  materialId: string;
  materialCode: string;
  materialName: string;
  materialDescription: string;
  materialUnit: string;
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

  get movementTypeName(): string {
    return this.props.movementTypeName;
  }

  get movementTypeDirection(): 'IN' | 'OUT' {
    return this.props.movementTypeDirection;
  }

  get userName(): string {
    return this.props.userName;
  }

  get locationId(): string {
    return this.props.locationId;
  }

  get locationCode(): string {
    return this.props.locationCode;
  }

  get locationName(): string {
    return this.props.locationName;
  }

  get subLocationId(): string {
    return this.props.subLocationId;
  }

  get subLocationCode(): string {
    return this.props.subLocationCode;
  }

  get subLocationName(): string {
    return this.props.subLocationName;
  }

  get rowId(): string {
    return this.props.rowId;
  }

  get rowCode(): string {
    return this.props.rowCode;
  }

  get rowName(): string {
    return this.props.rowName;
  }

  get shelfId(): string {
    return this.props.shelfId;
  }

  get shelfCode(): string {
    return this.props.shelfCode;
  }

  get shelfName(): string {
    return this.props.shelfName;
  }

  get positionId(): string {
    return this.props.positionId;
  }

  get positionCode(): string {
    return this.props.positionCode;
  }

  get positionName(): string {
    return this.props.positionName;
  }

  get materialId(): string {
    return this.props.materialId;
  }

  get materialCode(): string {
    return this.props.materialCode;
  }

  get materialName(): string {
    return this.props.materialName;
  }

  get materialDescription(): string {
    return this.props.materialDescription;
  }

  get materialUnit(): string {
    return this.props.materialUnit;
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
