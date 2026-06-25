import { SubLocation } from '@/domain/stock/enterprise/entities/sub-location';
import { SubLocationDetails } from '@/domain/stock/enterprise/entities/value-objects/sub-location-details';

import { LocationPresenter } from './location-presenter';

export class SubLocationPresenter {
  static toHTTP(subLocation: SubLocation) {
    return {
      id: subLocation.id.toString(),
      code: subLocation.code,
      name: subLocation.name,
      description: subLocation.description,
      locationId: subLocation.locationId.toString(),
    };
  }

  static toHTTPDetails(subLocation: SubLocationDetails) {
    return {
      id: subLocation.id.toString(),
      code: subLocation.code,
      name: subLocation.name,
      description: subLocation.description,
      location: LocationPresenter.toHTTP(subLocation.location),
    };
  }
}
