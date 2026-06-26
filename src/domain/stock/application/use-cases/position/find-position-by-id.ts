import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Position } from '../../../enterprise/entities/position';
import { PositionsRepository } from '../../repositories/positions-repository';
import { PositionNotFoundError } from './errors/position-not-found-error';

interface FindPositionByIdUseCaseRequest {
  authenticateId: string;
  positionId: string;
}

type FindPositionByIdUseCaseResponse = Either<
  UserNotFoundError | PositionNotFoundError,
  { position: Position }
>;

@Injectable()
export class FindPositionByIdUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _positionsRepository: PositionsRepository,
  ) {}

  async execute({
    authenticateId,
    positionId,
  }: FindPositionByIdUseCaseRequest): Promise<FindPositionByIdUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());

    const position = await this._positionsRepository.findById(positionId);
    if (
      !position ||
      position.companyId.toString() !== user.companyId.toString()
    )
      return left(new PositionNotFoundError());

    return right({ position });
  }
}
