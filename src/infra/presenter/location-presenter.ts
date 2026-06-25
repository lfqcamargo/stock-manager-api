import { Location } from '@/domain/stock/enterprise/entities/location';

export class LocationPresenter {
  static toHTTP(location: Location) {
    return {
      id: location.id.toString(),
      code: location.code,
      name: location.name,
      description: location.description,
    };
  }
}
