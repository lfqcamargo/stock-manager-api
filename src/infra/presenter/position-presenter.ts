import { Position } from '@/domain/stock/enterprise/entities/position';

export class PositionPresenter {
  static toHTTP(position: Position) {
    return {
      id: position.id.toString(),
      code: position.code,
      name: position.name,
      description: position.description,
    };
  }
}
