import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Shelf } from '../../../enterprise/entities/shelf';
import { ShelfsRepository } from '../../repositories/shelfs-repository';
import { AlreadyExistsShelfError } from './errors/already-exists-shelf-error';

interface CreateShelfUseCaseRequest {
  authenticateId: string;
  code: string;
  name: string;
  description?: string;
}

type CreateShelfUseCaseResponse = Either<
  UserNotFoundError | UserNotAllowedError | AlreadyExistsShelfError,
  { shelf: Shelf }
>;

@Injectable()
export class CreateShelfUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _shelfsRepository: ShelfsRepository,
  ) {}

  async execute({
    authenticateId,
    code,
    name,
    description,
  }: CreateShelfUseCaseRequest): Promise<CreateShelfUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    const shelfName = await this._shelfsRepository.findByName(
      user.companyId.toString(),
      name,
    );
    if (shelfName) return left(new AlreadyExistsShelfError());

    const shelfCode = await this._shelfsRepository.findByCode(
      user.companyId.toString(),
      code,
    );
    if (shelfCode) return left(new AlreadyExistsShelfError());

    const shelf = Shelf.create({
      companyId: user.companyId,
      code,
      name,
      description,
    });

    await this._shelfsRepository.create(shelf);

    return right({ shelf });
  }
}
