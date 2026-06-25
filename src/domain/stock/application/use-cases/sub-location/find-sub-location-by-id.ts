import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { SubLocation } from '../../../enterprise/entities/sub-location';
import { SubLocationsRepository } from '../../repositories/sub-locations-repository';
import { SubLocationNotFoundError } from './errors/sub-location-not-found-error';

interface FindSubLocationByIdUseCaseRequest {
  authenticateId: string;
  subLocationId: string;
}

type FindSubLocationByIdUseCaseResponse = Either<
  UserNotFoundError | SubLocationNotFoundError,
  { subLocation: SubLocation }
>;

@Injectable()
export class FindSubLocationByIdUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _subLocationsRepository: SubLocationsRepository,
  ) {}

  async execute({
    authenticateId,
    subLocationId,
  }: FindSubLocationByIdUseCaseRequest): Promise<FindSubLocationByIdUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());

    const subLocation =
      await this._subLocationsRepository.findById(subLocationId);
    if (
      !subLocation ||
      subLocation.companyId.toString() !== user.companyId.toString()
    )
      return left(new SubLocationNotFoundError());

    return right({ subLocation });
  }
}
