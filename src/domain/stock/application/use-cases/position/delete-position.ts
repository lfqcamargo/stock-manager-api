import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { AddressingsRepository } from '../../repositories/addressings-repository';
import { PositionsRepository } from '../../repositories/positions-repository';
import { AddressingHasBalanceError } from '../addressing/errors/addressing-has-balance-error';
import { PositionNotFoundError } from './errors/position-not-found-error';

interface DeletePositionUseCaseRequest {
  authenticateId: string;
  positionId: string;
}

type DeletePositionUseCaseResponse = Either<
  | UserNotFoundError
  | UserNotAllowedError
  | PositionNotFoundError
  | AddressingHasBalanceError,
  void
>;

@Injectable()
export class DeletePositionUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _positionsRepository: PositionsRepository,
    private readonly _addressingsRepository: AddressingsRepository,
  ) {}

  async execute({
    authenticateId,
    positionId,
  }: DeletePositionUseCaseRequest): Promise<DeletePositionUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    const position = await this._positionsRepository.findById(positionId);
    if (!position || position.companyId.toString() !== user.companyId.toString())
      return left(new PositionNotFoundError());

    const addressingsWithBalance = await this._addressingsRepository.fetchAll(
      {
        companyId: user.companyId.toString(),
        positionId,
        minAmount: 1,
      },
      { page: 1, itemsPerPage: 1 },
    );
    if (addressingsWithBalance.data.length > 0)
      return left(new AddressingHasBalanceError());

    await this._addressingsRepository.deleteMany(
      {
        companyId: user.companyId.toString(),
        positionId,
      },
      { commit: false },
    );

    await this._positionsRepository.delete(positionId);

    return right(void 0);
  }
}
