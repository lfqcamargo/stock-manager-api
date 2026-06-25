import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Location } from '../../../enterprise/entities/location';
import { LocationsRepository } from '../../repositories/locations-repository';
import { AlreadyExistsLocationError } from './errors/already-exists-location-error';

interface CreateLocationUseCaseRequest {
  authenticateId: string;
  code: string;
  name: string;
  description?: string;
}

type CreateLocationUseCaseResponse = Either<
  UserNotFoundError | UserNotAllowedError | AlreadyExistsLocationError,
  { location: Location }
>;

@Injectable()
export class CreateLocationUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _locationsRepository: LocationsRepository,
  ) {}

  async execute({
    authenticateId,
    code,
    name,
    description,
  }: CreateLocationUseCaseRequest): Promise<CreateLocationUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    const locationName = await this._locationsRepository.findByName(
      user.companyId.toString(),
      name,
    );
    if (locationName) return left(new AlreadyExistsLocationError('Name'));

    const locationCode = await this._locationsRepository.findByCode(
      user.companyId.toString(),
      code,
    );
    if (locationCode) return left(new AlreadyExistsLocationError('Code'));

    const location = Location.create({
      companyId: user.companyId,
      code,
      name,
      description,
    });

    await this._locationsRepository.create(location);

    return right({ location });
  }
}
