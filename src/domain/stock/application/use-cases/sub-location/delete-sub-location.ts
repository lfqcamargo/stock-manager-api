import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { AddressingsRepository } from '../../repositories/addressings-repository';
import { SubLocationsRepository } from '../../repositories/sub-locations-repository';
import { AddressingHasBalanceError } from '../addressing/errors/addressing-has-balance-error';
import { SubLocationNotFoundError } from './errors/sub-location-not-found-error';

interface DeleteSubLocationUseCaseRequest {
  authenticateId: string;
  subLocationId: string;
}

type DeleteSubLocationUseCaseResponse = Either<
  | UserNotFoundError
  | UserNotAllowedError
  | SubLocationNotFoundError
  | AddressingHasBalanceError,
  void
>;

@Injectable()
export class DeleteSubLocationUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _subLocationsRepository: SubLocationsRepository,
    private readonly _addressingsRepository: AddressingsRepository,
  ) {}

  async execute({
    authenticateId,
    subLocationId,
  }: DeleteSubLocationUseCaseRequest): Promise<DeleteSubLocationUseCaseResponse> {
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

    const addressingsWithBalance = await this._addressingsRepository.fetchAll(
      {
        companyId: user.companyId.toString(),
        subLocationId,
        minAmount: 1,
      },
      { page: 1, itemsPerPage: 1 },
    );
    if (addressingsWithBalance.data.length > 0)
      return left(new AddressingHasBalanceError());

    await this._addressingsRepository.deleteMany(
      {
        companyId: user.companyId.toString(),
        subLocationId,
      },
      { commit: false },
    );

    await this._subLocationsRepository.delete(subLocationId);

    return right(void 0);
  }
}
