import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { SubLocation } from '../../../enterprise/entities/sub-location';
import { SubLocationsRepository } from '../../repositories/sub-locations-repository';
import { AlreadyExistsSubLocationError } from './errors/already-exists-sub-location-error';
import { SubLocationNotFoundError } from './errors/sub-location-not-found-error';

interface EditSubLocationUseCaseRequest {
  authenticateId: string;
  subLocationId: string;
  code: string;
  name: string;
  description?: string | null;
}

type EditSubLocationUseCaseResponse = Either<
  | UserNotFoundError
  | UserNotAllowedError
  | AlreadyExistsSubLocationError
  | SubLocationNotFoundError,
  { subLocation: SubLocation }
>;

@Injectable()
export class EditSubLocationUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _subLocationsRepository: SubLocationsRepository,
  ) {}

  async execute({
    authenticateId,
    subLocationId,
    code,
    name,
    description,
  }: EditSubLocationUseCaseRequest): Promise<EditSubLocationUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    const subLocation =
      await this._subLocationsRepository.findById(subLocationId);
    if (
      !subLocation ||
      subLocation.companyId.toString() !== user.companyId.toString()
    )
      return left(new SubLocationNotFoundError());

    if (subLocation.code !== code) {
      const subLocationCode = await this._subLocationsRepository.findByCode(
        user.companyId.toString(),
        code,
      );
      if (subLocationCode) return left(new AlreadyExistsSubLocationError());
      subLocation.code = code;
    }

    if (subLocation.name !== name) {
      const subLocationName = await this._subLocationsRepository.findByName(
        user.companyId.toString(),
        subLocation.locationId.toString(),
        name,
      );
      if (subLocationName) return left(new AlreadyExistsSubLocationError());
      subLocation.name = name;
    }

    if (description !== undefined) {
      subLocation.description = description;
    }

    await this._subLocationsRepository.update(subLocation);

    return right({ subLocation });
  }
}
