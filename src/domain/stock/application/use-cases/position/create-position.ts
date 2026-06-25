import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Position } from '../../../enterprise/entities/position';
import { PositionsRepository } from '../../repositories/positions-repository';
import { AlreadyExistsPositionError } from './errors/already-exists-position-error';

interface CreatePositionUseCaseRequest {
  authenticateId: string;
  code: string;
  name: string;
  description?: string;
}

type CreatePositionUseCaseResponse = Either<
  UserNotFoundError | UserNotAllowedError | AlreadyExistsPositionError,
  { position: Position }
>;

@Injectable()
export class CreatePositionUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _positionsRepository: PositionsRepository,
  ) {}

  async execute({
    authenticateId,
    code,
    name,
    description,
  }: CreatePositionUseCaseRequest): Promise<CreatePositionUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    const positionName = await this._positionsRepository.findByName(
      user.companyId.toString(),
      name,
    );
    if (positionName) return left(new AlreadyExistsPositionError());

    const positionCode = await this._positionsRepository.findByCode(
      user.companyId.toString(),
      code,
    );
    if (positionCode) return left(new AlreadyExistsPositionError());

    const position = Position.create({
      companyId: user.companyId,
      code,
      name,
      description,
    });

    await this._positionsRepository.create(position);

    return right({ position });
  }
}
