import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Row } from '../../../enterprise/entities/row';
import { RowsRepository } from '../../repositories/rows-repository';
import { AlreadyExistsRowError } from './errors/already-exists-row-error';
import { RowNotFoundError } from './errors/row-not-found-error';

interface EditRowUseCaseRequest {
  authenticateId: string;
  rowId: string;
  code: string;
  name: string;
  description?: string | null;
}

type EditRowUseCaseResponse = Either<
  | UserNotFoundError
  | UserNotAllowedError
  | AlreadyExistsRowError
  | RowNotFoundError,
  { row: Row }
>;

@Injectable()
export class EditRowUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _rowsRepository: RowsRepository,
  ) {}

  async execute({
    authenticateId,
    rowId,
    code,
    name,
    description,
  }: EditRowUseCaseRequest): Promise<EditRowUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    const row = await this._rowsRepository.findById(rowId);
    if (!row || row.companyId.toString() !== user.companyId.toString())
      return left(new RowNotFoundError());

    if (row.code !== code) {
      const rowCode = await this._rowsRepository.findByCode(
        user.companyId.toString(),
        code,
      );
      if (rowCode) return left(new AlreadyExistsRowError());
      row.code = code;
    }

    if (row.name !== name) {
      const rowName = await this._rowsRepository.findByName(
        user.companyId.toString(),
        name,
      );
      if (rowName) return left(new AlreadyExistsRowError());
      row.name = name;
    }

    if (description !== undefined) {
      row.description = description ?? undefined;
    }

    await this._rowsRepository.update(row);

    return right({ row });
  }
}
