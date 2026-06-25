import { Addressing } from '@/domain/stock/enterprise/entities/addressing';
import { AddressingDetails } from '@/domain/stock/enterprise/entities/value-objects/addressing-details';

import { LocationPresenter } from './location-presenter';
import { MaterialPresenter } from './material-presenter';
import { PositionPresenter } from './position-presenter';
import { RowPresenter } from './row-presenter';
import { ShelfPresenter } from './shelf-presenter';
import { SubLocationPresenter } from './sub-location-presenter';

export class AddressingPresenter {
  static toHTTP(addressing: Addressing) {
    return {
      id: addressing.id.toString(),
      amount: addressing.amount,
      active: addressing.active,
      locationId: addressing.locationId.toString(),
      subLocationId: addressing.subLocationId.toString(),
      rowId: addressing.rowId.toString(),
      shelfId: addressing.shelfId.toString(),
      positionId: addressing.positionId.toString(),
      materialId: addressing.materialId?.toString() ?? null,
    };
  }

  static toHTTPDetails(addressing: AddressingDetails) {
    return {
      id: addressing.id.toString(),
      amount: addressing.amount,
      active: addressing.active,
      location: LocationPresenter.toHTTP(addressing.location),
      subLocation: SubLocationPresenter.toHTTP(addressing.subLocation),
      row: RowPresenter.toHTTP(addressing.row),
      shelf: ShelfPresenter.toHTTP(addressing.shelf),
      position: PositionPresenter.toHTTP(addressing.position),
      material: addressing.material
        ? MaterialPresenter.toHTTP(addressing.material)
        : null,
    };
  }
}
