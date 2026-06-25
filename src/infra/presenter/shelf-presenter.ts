import { Shelf } from '@/domain/stock/enterprise/entities/shelf';

export class ShelfPresenter {
  static toHTTP(shelf: Shelf) {
    return {
      id: shelf.id.toString(),
      code: shelf.code,
      name: shelf.name,
      description: shelf.description,
    };
  }
}
