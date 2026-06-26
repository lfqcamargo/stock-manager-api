import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Position } from '../../../enterprise/entities/position';
import { PositionsRepository } from '../../repositories/positions-repository';
import { AlreadyExistsPositionError } from './errors/already-exists-position-error';
import { PositionNotFoundError } from './errors/position-not-found-error';

interface EditPositionUseCaseRequest {
  authenticateId: string;
  positionId: string;
  code: string;
  name: string;
  description?: string | null;
}

type EditPositionUseCaseResponse = Either<
  | UserNotFoundError
  | UserNotAllowedError
  | AlreadyExistsPositionError
  | PositionNotFoundError,
  { position: Position }
>;

@Injectable()
export class EditPositionUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _positionsRepository: PositionsRepository,
  ) {}

  async execute({
    authenticateId,
    positionId,
    code,
    name,
    description,
  }: EditPositionUseCaseRequest): Promise<EditPositionUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    const position = await this._positionsRepository.findById(positionId);
    if (
      !position ||
      position.companyId.toString() !== user.companyId.toString()
    )
      return left(new PositionNotFoundError());

    if (position.code !== code) {
      const positionCode = await this._positionsRepository.findByCode(
        user.companyId.toString(),
        code,
      );
      if (positionCode) return left(new AlreadyExistsPositionError());
      position.code = code;
    }

    if (position.name !== name) {
      const positionName = await this._positionsRepository.findByName(
        user.companyId.toString(),
        name,
      );
      if (positionName) return left(new AlreadyExistsPositionError());
      position.name = name;
    }

    if (description !== undefined) {
      position.description = description ?? undefined;
    }

    await this._positionsRepository.update(position);

    return right({ position });
  }
}
