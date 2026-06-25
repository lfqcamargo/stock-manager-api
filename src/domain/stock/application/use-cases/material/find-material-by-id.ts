import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { Material } from '@/domain/stock/enterprise/entities/material';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { MaterialsRepository } from '../../repositories/materials-repository';
import { MaterialNotFoundError } from './errors/material-not-found-error';

interface FindMaterialUseCaseRequest {
  authenticateId: string;
  materialId: string;
}

type FindMaterialUseCaseResponse = Either<
  UserNotFoundError | MaterialNotFoundError,
  { material: Material }
>;

@Injectable()
export class FindMaterialByIdUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _materialsRepository: MaterialsRepository,
  ) {}

  async execute({
    authenticateId,
    materialId,
  }: FindMaterialUseCaseRequest): Promise<FindMaterialUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());

    const material = await this._materialsRepository.findById(materialId);
    if (
      !material ||
      material.companyId.toString() !== user.companyId.toString()
    )
      return left(new MaterialNotFoundError());

    return right({ material: material });
  }
}
