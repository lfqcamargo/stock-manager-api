import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Addressing } from '../../../enterprise/entities/addressing';
import { AddressingsRepository } from '../../repositories/addressings-repository';
import { AddressingNotFoundError } from './errors/addressing-not-found-error';

interface FindAddressingByIdUseCaseRequest {
  authenticateId: string;
  addressingId: string;
}

type FindAddressingByIdUseCaseResponse = Either<
  UserNotFoundError | AddressingNotFoundError,
  { addressing: Addressing }
>;

@Injectable()
export class FindAddressingByIdUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _addressingsRepository: AddressingsRepository,
  ) {}

  async execute({
    authenticateId,
    addressingId,
  }: FindAddressingByIdUseCaseRequest): Promise<FindAddressingByIdUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());

    const addressing = await this._addressingsRepository.findById(addressingId);
    if (
      !addressing ||
      addressing.companyId.toString() !== user.companyId.toString()
    )
      return left(new AddressingNotFoundError());

    return right({ addressing });
  }
}
