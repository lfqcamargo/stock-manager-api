import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { MaterialsRepository } from '../../repositories/materials-repository';
import { MaterialNotFoundError } from './errors/material-not-found-error';

interface DeleteMaterialUseCaseRequest {
  authenticateId: string;
  materialId: string;
}

type DeleteMaterialUseCaseResponse = Either<
  UserNotFoundError | UserNotAllowedError | MaterialNotFoundError,
  void
>;

@Injectable()
export class DeleteMaterialUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _materialsRepository: MaterialsRepository,
  ) {}

  async execute({
    authenticateId,
    materialId,
  }: DeleteMaterialUseCaseRequest): Promise<DeleteMaterialUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    const material = await this._materialsRepository.findById(
      user.companyId.toString(),
      materialId,
    );
    if (!material) return left(new MaterialNotFoundError());

    await this._materialsRepository.delete(material);

    return right(void 0);
  }
}
