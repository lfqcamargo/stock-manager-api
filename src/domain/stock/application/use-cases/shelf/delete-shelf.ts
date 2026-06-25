import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { AddressingsRepository } from '../../repositories/addressings-repository';
import { ShelfsRepository } from '../../repositories/shelfs-repository';
import { AddressingHasBalanceError } from '../addressing/errors/addressing-has-balance-error';
import { ShelfNotFoundError } from './errors/shelf-not-found-error';

interface DeleteShelfUseCaseRequest {
  authenticateId: string;
  shelfId: string;
}

type DeleteShelfUseCaseResponse = Either<
  | UserNotFoundError
  | UserNotAllowedError
  | ShelfNotFoundError
  | AddressingHasBalanceError,
  void
>;

@Injectable()
export class DeleteShelfUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _shelfsRepository: ShelfsRepository,
    private readonly _addressingsRepository: AddressingsRepository,
  ) {}

  async execute({
    authenticateId,
    shelfId,
  }: DeleteShelfUseCaseRequest): Promise<DeleteShelfUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    const shelf = await this._shelfsRepository.findById(shelfId);
    if (!shelf || shelf.companyId.toString() !== user.companyId.toString())
      return left(new ShelfNotFoundError());

    const addressingsWithBalance = await this._addressingsRepository.fetchAll(
      {
        companyId: user.companyId.toString(),
        shelfId,
        minAmount: 1,
      },
      { page: 1, itemsPerPage: 1 },
    );
    if (addressingsWithBalance.data.length > 0)
      return left(new AddressingHasBalanceError());

    await this._addressingsRepository.deleteMany(
      {
        companyId: user.companyId.toString(),
        shelfId,
      },
      { commit: false },
    );

    await this._shelfsRepository.delete(shelfId);

    return right(void 0);
  }
}
