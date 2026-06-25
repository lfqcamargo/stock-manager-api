import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Row } from '../../../enterprise/entities/row';
import { RowsRepository } from '../../repositories/rows-repository';
import { AlreadyExistsRowError } from './errors/already-exists-row-error';

interface CreateRowUseCaseRequest {
  authenticateId: string;
  code: string;
  name: string;
  description?: string;
}

type CreateRowUseCaseResponse = Either<
  UserNotFoundError | UserNotAllowedError | AlreadyExistsRowError,
  { row: Row }
>;

@Injectable()
export class CreateRowUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _rowsRepository: RowsRepository,
  ) {}

  async execute({
    authenticateId,
    code,
    name,
    description,
  }: CreateRowUseCaseRequest): Promise<CreateRowUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    const rowName = await this._rowsRepository.findByName(
      user.companyId.toString(),
      name,
    );
    if (rowName) return left(new AlreadyExistsRowError());

    const rowCode = await this._rowsRepository.findByCode(
      user.companyId.toString(),
      code,
    );
    if (rowCode) return left(new AlreadyExistsRowError());

    const row = Row.create({
      companyId: user.companyId,
      code,
      name,
      description,
    });

    await this._rowsRepository.create(row);

    return right({ row });
  }
}
