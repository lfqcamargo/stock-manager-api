import { Movement } from '@/domain/stock/enterprise/entities/movement';

export class MovementPresenter {
  static toHTTP(movement: Movement) {
    return {
      id: movement.id.toString(),
      addressingId: movement.addressingId.toString(),
      movementTypeId: movement.movementTypeId.toString(),
      userId: movement.userId.toString(),
      quantity: movement.quantity,
      date: movement.date,
      observation: movement.observation,
      createdAt: movement.createdAt,
    };
  }
}
