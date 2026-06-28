import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UnitOfWork } from '@/core/repositories/unit-of-work';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { AddressingsRepository } from '../../repositories/addressings-repository';
import { LocationsRepository } from '../../repositories/locations-repository';
import { SubLocationsRepository } from '../../repositories/sub-locations-repository';
import { AddressingHasBalanceError } from '../addressing/errors/addressing-has-balance-error';
import { LocationNotFoundError } from './errors/location-not-found-error';

interface DeleteLocationUseCaseRequest {
  authenticateId: string;
  locationId: string;
}

type DeleteLocationUseCaseResponse = Either<
  | UserNotFoundError
  | UserNotAllowedError
  | LocationNotFoundError
  | AddressingHasBalanceError,
  void
>;

@Injectable()
export class DeleteLocationUseCase {
  constructor(
    private readonly _unitOfWork: UnitOfWork,
    private readonly _usersRepository: UsersRepository,
    private readonly _locationsRepository: LocationsRepository,
    private readonly _addressingsRepository: AddressingsRepository,
    private readonly _subLocationsRepository: SubLocationsRepository,
  ) {}

  async execute({
    authenticateId,
    locationId,
  }: DeleteLocationUseCaseRequest): Promise<DeleteLocationUseCaseResponse> {
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

    const addressingsWithBalance = await this._addressingsRepository.fetchAll(
      { companyId: user.companyId.toString(), locationId, minAmount: 1 },
      { page: 1, itemsPerPage: 1 },
    );
    if (addressingsWithBalance.data.length > 0)
      return left(new AddressingHasBalanceError());

    await this._unitOfWork.execute(async (ctx) => {
      await this._addressingsRepository.deleteMany(
        { companyId: user.companyId.toString(), locationId },
        { transactionContext: ctx },
      );
      await this._subLocationsRepository.deleteMany(
        { companyId: user.companyId.toString(), locationId },
        { transactionContext: ctx },
      );
      await this._locationsRepository.delete(locationId, {
        transactionContext: ctx,
      });
    });

    return right(void 0);
  }
}
