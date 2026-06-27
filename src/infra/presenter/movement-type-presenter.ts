import { MovementType } from '@/domain/stock/enterprise/entities/movement-type';

export class MovementTypePresenter {
  static toHTTP(movementType: MovementType) {
    return {
      id: movementType.id.toString(),
      name: movementType.name,
      direction: movementType.direction,
    };
  }
}
