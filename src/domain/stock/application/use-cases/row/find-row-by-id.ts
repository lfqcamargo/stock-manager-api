import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Row } from '../../../enterprise/entities/row';
import { RowsRepository } from '../../repositories/rows-repository';
import { RowNotFoundError } from './errors/row-not-found-error';

interface FindRowByIdUseCaseRequest {
  authenticateId: string;
  rowId: string;
}

type FindRowByIdUseCaseResponse = Either<
  UserNotFoundError | RowNotFoundError,
  { row: Row }
>;

@Injectable()
export class FindRowByIdUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _rowsRepository: RowsRepository,
  ) {}

  async execute({
    authenticateId,
    rowId,
  }: FindRowByIdUseCaseRequest): Promise<FindRowByIdUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());

    const row = await this._rowsRepository.findById(rowId);
    if (!row || row.companyId.toString() !== user.companyId.toString())
      return left(new RowNotFoundError());

    return right({ row });
  }
}
