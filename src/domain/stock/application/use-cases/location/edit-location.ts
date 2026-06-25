import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Location } from '../../../enterprise/entities/location';
import { LocationsRepository } from '../../repositories/locations-repository';
import { AlreadyExistsLocationError } from './errors/already-exists-location-error';
import { LocationNotFoundError } from './errors/location-not-found-error';

interface EditLocationUseCaseRequest {
  authenticateId: string;
  locationId: string;
  code: string;
  name: string;
  description?: string | null;
}

type EditLocationUseCaseResponse = Either<
  | UserNotFoundError
  | UserNotAllowedError
  | AlreadyExistsLocationError
  | LocationNotFoundError,
  { location: Location }
>;

@Injectable()
export class EditLocationUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _locationsRepository: LocationsRepository,
  ) {}

  async execute({
    authenticateId,
    locationId,
    code,
    name,
    description,
  }: EditLocationUseCaseRequest): Promise<EditLocationUseCaseResponse> {
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

    if (location.code !== code) {
      const locationCode = await this._locationsRepository.findByCode(
        user.companyId.toString(),
        code,
      );
      if (locationCode) return left(new AlreadyExistsLocationError('Code'));

      location.code = code;
    }

    if (location.name !== name) {
      const locationName = await this._locationsRepository.findByName(
        user.companyId.toString(),
        name,
      );
      if (locationName) return left(new AlreadyExistsLocationError('Name'));

      location.name = name;
    }

    if (description !== undefined) {
      location.description = description ?? undefined;
    }

    await this._locationsRepository.update(location);

    return right({ location });
  }
}
