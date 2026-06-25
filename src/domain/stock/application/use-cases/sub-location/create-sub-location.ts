import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { SubLocation } from '../../../enterprise/entities/sub-location';
import { LocationsRepository } from '../../repositories/locations-repository';
import { SubLocationsRepository } from '../../repositories/sub-locations-repository';
import { LocationNotFoundError } from '../location/errors/location-not-found-error';
import { AlreadyExistsSubLocationError } from './errors/already-exists-sub-location-error';

interface CreateSubLocationUseCaseRequest {
  authenticateId: string;
  locationId: string;
  code: string;
  name: string;
  description?: string;
}

type CreateSubLocationUseCaseResponse = Either<
  | UserNotFoundError
  | UserNotAllowedError
  | LocationNotFoundError
  | AlreadyExistsSubLocationError,
  { subLocation: SubLocation }
>;

@Injectable()
export class CreateSubLocationUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _locationsRepository: LocationsRepository,
    private readonly _subLocationsRepository: SubLocationsRepository,
  ) {}

  async execute({
    authenticateId,
    locationId,
    code,
    name,
    description,
  }: CreateSubLocationUseCaseRequest): Promise<CreateSubLocationUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    const location = await this._locationsRepository.findById(locationId);
    if (
      !location ||
      location.companyId.toString() !== user.companyId.toString()
    )
      return left(new LocationNotFoundError());

    const subLocationName = await this._subLocationsRepository.findByName(
      user.companyId.toString(),
      locationId,
      name,
    );
    if (subLocationName) return left(new AlreadyExistsSubLocationError());

    const subLocationCode = await this._subLocationsRepository.findByCode(
      user.companyId.toString(),
      code,
    );
    if (subLocationCode) return left(new AlreadyExistsSubLocationError());

    const subLocation = SubLocation.create({
      companyId: user.companyId,
      locationId: location.id,
      code,
      name,
      description,
    });

    await this._subLocationsRepository.create(subLocation);

    return right({ subLocation });
  }
}
