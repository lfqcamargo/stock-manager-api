import { Row } from '@/domain/stock/enterprise/entities/row';

export class RowPresenter {
  static toHTTP(row: Row) {
    return {
      id: row.id.toString(),
      code: row.code,
      name: row.name,
      description: row.description,
    };
  }
}
