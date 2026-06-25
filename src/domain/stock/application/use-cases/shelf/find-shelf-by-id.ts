import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Shelf } from '../../../enterprise/entities/shelf';
import { ShelfsRepository } from '../../repositories/shelfs-repository';
import { ShelfNotFoundError } from './errors/shelf-not-found-error';

interface FindShelfByIdUseCaseRequest {
  authenticateId: string;
  shelfId: string;
}

type FindShelfByIdUseCaseResponse = Either<
  UserNotFoundError | ShelfNotFoundError,
  { shelf: Shelf }
>;

@Injectable()
export class FindShelfByIdUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _shelfsRepository: ShelfsRepository,
  ) {}

  async execute({
    authenticateId,
    shelfId,
  }: FindShelfByIdUseCaseRequest): Promise<FindShelfByIdUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());

    const shelf = await this._shelfsRepository.findById(shelfId);
    if (!shelf || shelf.companyId.toString() !== user.companyId.toString())
      return left(new ShelfNotFoundError());

    return right({ shelf });
  }
}
