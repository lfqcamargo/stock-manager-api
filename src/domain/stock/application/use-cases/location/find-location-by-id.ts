import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Location } from '../../../enterprise/entities/location';
import { LocationsRepository } from '../../repositories/locations-repository';
import { LocationNotFoundError } from './errors/location-not-found-error';

interface FindLocationByIdUseCaseRequest {
  authenticateId: string;
  locationId: string;
}

type FindLocationByIdUseCaseResponse = Either<
  UserNotFoundError | LocationNotFoundError,
  { location: Location }
>;

@Injectable()
export class FindLocationByIdUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _locationsRepository: LocationsRepository,
  ) {}

  async execute({
    authenticateId,
    locationId,
  }: FindLocationByIdUseCaseRequest): Promise<FindLocationByIdUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());

    const location = await this._locationsRepository.findById(locationId);
    if (
      !location ||
      location.companyId.toString() !== user.companyId.toString()
    )
      return left(new LocationNotFoundError());

    return right({ location });
  }
}
