import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Shelf } from '../../../enterprise/entities/shelf';
import { ShelfsRepository } from '../../repositories/shelfs-repository';
import { AlreadyExistsShelfError } from './errors/already-exists-shelf-error';
import { ShelfNotFoundError } from './errors/shelf-not-found-error';

interface EditShelfUseCaseRequest {
  authenticateId: string;
  shelfId: string;
  code: string;
  name: string;
  description?: string | null;
}

type EditShelfUseCaseResponse = Either<
  | UserNotFoundError
  | UserNotAllowedError
  | AlreadyExistsShelfError
  | ShelfNotFoundError,
  { shelf: Shelf }
>;

@Injectable()
export class EditShelfUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _shelfsRepository: ShelfsRepository,
  ) {}

  async execute({
    authenticateId,
    shelfId,
    code,
    name,
    description,
  }: EditShelfUseCaseRequest): Promise<EditShelfUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    const shelf = await this._shelfsRepository.findById(shelfId);
    if (!shelf || shelf.companyId.toString() !== user.companyId.toString())
      return left(new ShelfNotFoundError());

    if (shelf.code !== code) {
      const shelfCode = await this._shelfsRepository.findByCode(
        user.companyId.toString(),
        code,
      );
      if (shelfCode) return left(new AlreadyExistsShelfError());
      shelf.code = code;
    }

    if (shelf.name !== name) {
      const shelfName = await this._shelfsRepository.findByName(
        user.companyId.toString(),
        name,
      );
      if (shelfName) return left(new AlreadyExistsShelfError());
      shelf.name = name;
    }

    if (description !== undefined) {
      shelf.description = description ?? undefined;
    }

    await this._shelfsRepository.update(shelf);

    return right({ shelf });
  }
}
