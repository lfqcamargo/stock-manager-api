import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { AddressingsRepository } from '../../repositories/addressings-repository';
import { RowsRepository } from '../../repositories/rows-repository';
import { AddressingHasBalanceError } from '../addressing/errors/addressing-has-balance-error';
import { RowNotFoundError } from './errors/row-not-found-error';

interface DeleteRowUseCaseRequest {
  authenticateId: string;
  rowId: string;
}

type DeleteRowUseCaseResponse = Either<
  | UserNotFoundError
  | UserNotAllowedError
  | RowNotFoundError
  | AddressingHasBalanceError,
  void
>;

@Injectable()
export class DeleteRowUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _rowsRepository: RowsRepository,
    private readonly _addressingsRepository: AddressingsRepository,
  ) {}

  async execute({
    authenticateId,
    rowId,
  }: DeleteRowUseCaseRequest): Promise<DeleteRowUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    const row = await this._rowsRepository.findById(rowId);
    if (!row || row.companyId.toString() !== user.companyId.toString())
      return left(new RowNotFoundError());

    const addressingsWithBalance = await this._addressingsRepository.fetchAll(
      {
        companyId: user.companyId.toString(),
        rowId,
        minAmount: 1,
      },
      { page: 1, itemsPerPage: 1 },
    );
    if (addressingsWithBalance.data.length > 0)
      return left(new AddressingHasBalanceError());

    await this._addressingsRepository.deleteMany(
      {
        companyId: user.companyId.toString(),
        rowId,
      },
      { commit: false },
    );

    await this._rowsRepository.delete(rowId);

    return right(void 0);
  }
}
