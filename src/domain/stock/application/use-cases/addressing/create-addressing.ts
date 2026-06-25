import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Addressing } from '../../../enterprise/entities/addressing';
import { AddressingsRepository } from '../../repositories/addressings-repository';
import { LocationsRepository } from '../../repositories/locations-repository';
import { MaterialsRepository } from '../../repositories/materials-repository';
import { PositionsRepository } from '../../repositories/positions-repository';
import { RowsRepository } from '../../repositories/rows-repository';
import { ShelfsRepository } from '../../repositories/shelfs-repository';
import { SubLocationsRepository } from '../../repositories/sub-locations-repository';
import { LocationNotFoundError } from '../location/errors/location-not-found-error';
import { MaterialNotFoundError } from '../material/errors/material-not-found-error';
import { PositionNotFoundError } from '../position/errors/position-not-found-error';
import { RowNotFoundError } from '../row/errors/row-not-found-error';
import { ShelfNotFoundError } from '../shelf/errors/shelf-not-found-error';
import { SubLocationNotFoundError } from '../sub-location/errors/sub-location-not-found-error';

interface CreateAddressingUseCaseRequest {
  authenticateId: string;
  locationId: string;
  subLocationId: string;
  rowId: string;
  shelfId: string;
  positionId: string;
  materialId?: string;
  active?: boolean;
}

type CreateAddressingUseCaseResponse = Either<
  | UserNotFoundError
  | UserNotAllowedError
  | LocationNotFoundError
  | SubLocationNotFoundError
  | RowNotFoundError
  | ShelfNotFoundError
  | PositionNotFoundError
  | MaterialNotFoundError,
  { addressing: Addressing }
>;

@Injectable()
export class CreateAddressingUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _addressingsRepository: AddressingsRepository,
    private readonly _locationsRepository: LocationsRepository,
    private readonly _subLocationsRepository: SubLocationsRepository,
    private readonly _rowsRepository: RowsRepository,
    private readonly _shelfsRepository: ShelfsRepository,
    private readonly _positionsRepository: PositionsRepository,
    private readonly _materialsRepository: MaterialsRepository,
  ) {}

  async execute({
    authenticateId,
    locationId,
    subLocationId,
    rowId,
    shelfId,
    positionId,
    materialId,
    active = true,
  }: CreateAddressingUseCaseRequest): Promise<CreateAddressingUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    const companyId = user.companyId.toString();

    const location = await this._locationsRepository.findById(locationId);
    if (!location || location.companyId.toString() !== companyId)
      return left(new LocationNotFoundError());

    const subLocation =
      await this._subLocationsRepository.findById(subLocationId);

    if (
      !subLocation ||
      subLocation.companyId.toString() !== companyId ||
      subLocation.locationId.toString() !== locationId
    )
      return left(new SubLocationNotFoundError());

    const row = await this._rowsRepository.findById(rowId);
    if (!row || row.companyId.toString() !== companyId)
      return left(new RowNotFoundError());

    const shelf = await this._shelfsRepository.findById(shelfId);
    if (!shelf || shelf.companyId.toString() !== companyId)
      return left(new ShelfNotFoundError());

    const position = await this._positionsRepository.findById(positionId);
    if (!position || position.companyId.toString() !== companyId)
      return left(new PositionNotFoundError());

    if (materialId) {
      const material = await this._materialsRepository.findById(materialId);
      if (!material || material.companyId.toString() !== companyId)
        return left(new MaterialNotFoundError());
    }

    const addressing = Addressing.create({
      companyId: user.companyId,
      locationId: new UniqueEntityID(locationId),
      subLocationId: new UniqueEntityID(subLocationId),
      rowId: new UniqueEntityID(rowId),
      shelfId: new UniqueEntityID(shelfId),
      positionId: new UniqueEntityID(positionId),
      materialId: materialId ? new UniqueEntityID(materialId) : null,
      amount: 0,
      active,
    });

    await this._addressingsRepository.create(addressing);

    return right({ addressing });
  }
}
