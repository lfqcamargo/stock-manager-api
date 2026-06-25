import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Addressing } from '../../../enterprise/entities/addressing';
import { AddressingsRepository } from '../../repositories/addressings-repository';
import { MaterialsRepository } from '../../repositories/materials-repository';
import { MaterialNotFoundError } from '../material/errors/material-not-found-error';
import { AddressingNotFoundError } from './errors/addressing-not-found-error';

interface EditAddressingUseCaseRequest {
  authenticateId: string;
  addressingId: string;
  active: boolean;
  materialId?: string | null;
}

type EditAddressingUseCaseResponse = Either<
  | UserNotFoundError
  | UserNotAllowedError
  | AddressingNotFoundError
  | MaterialNotFoundError,
  { addressing: Addressing }
>;

@Injectable()
export class EditAddressingUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _addressingsRepository: AddressingsRepository,
    private readonly _materialsRepository: MaterialsRepository,
  ) {}

  async execute({
    authenticateId,
    addressingId,
    active,
    materialId,
  }: EditAddressingUseCaseRequest): Promise<EditAddressingUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    const addressing = await this._addressingsRepository.findById(addressingId);
    if (
      !addressing ||
      addressing.companyId.toString() !== user.companyId.toString()
    )
      return left(new AddressingNotFoundError());

    if (materialId) {
      const material = await this._materialsRepository.findById(materialId);
      if (
        !material ||
        material.companyId.toString() !== user.companyId.toString()
      )
        return left(new MaterialNotFoundError());
      addressing.materialId = new UniqueEntityID(materialId);
    } else if (
      materialId === null ||
      materialId === undefined ||
      materialId === ''
    ) {
      addressing.materialId = null;
    }

    addressing.active = active;

    await this._addressingsRepository.update(addressing);

    return right({ addressing });
  }
}
