import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { AddressingsRepository } from '../../repositories/addressings-repository';
import { AddressingHasBalanceError } from './errors/addressing-has-balance-error';
import { AddressingNotFoundError } from './errors/addressing-not-found-error';

interface DeleteAddressingUseCaseRequest {
  authenticateId: string;
  addressingId: string;
}

type DeleteAddressingUseCaseResponse = Either<
  | UserNotFoundError
  | UserNotAllowedError
  | AddressingNotFoundError
  | AddressingHasBalanceError,
  void
>;

@Injectable()
export class DeleteAddressingUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _addressingsRepository: AddressingsRepository,
  ) {}

  async execute({
    authenticateId,
    addressingId,
  }: DeleteAddressingUseCaseRequest): Promise<DeleteAddressingUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    const addressing = await this._addressingsRepository.findById(addressingId);
    if (
      !addressing ||
      addressing.companyId.toString() !== user.companyId.toString()
    )
      return left(new AddressingNotFoundError());

    if (addressing.amount > 0)
      return left(
        new AddressingHasBalanceError('Cannot delete addressing with balance.'),
      );

    await this._addressingsRepository.delete(addressingId);

    return right(void 0);
  }
}
