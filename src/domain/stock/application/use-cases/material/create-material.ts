import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Material } from '../../../enterprise/entities/material';
import { UnitMeasure } from '../../../enterprise/entities/value-objects/unit-measure';
import { GroupsRepository } from '../../repositories/groups-repository';
import { MaterialsRepository } from '../../repositories/materials-repository';
import { GroupNotFoundError } from '../group/errors/group-not-found-error';
import { AlreadyExistsMaterialError } from './errors/already-exists-material-error';
import { InvalidUnitMeasureError } from './errors/invalid-unit-measure-error';

interface CreateMaterialUseCaseRequest {
  authenticateId: string;
  groupId: string;
  code: string;
  name: string;
  description?: string;
  unit: string;
  active: boolean;
}

type CreateMaterialUseCaseResponse = Either<
  | UserNotFoundError
  | UserNotAllowedError
  | GroupNotFoundError
  | AlreadyExistsMaterialError
  | InvalidUnitMeasureError,
  { material: Material }
>;

@Injectable()
export class CreateMaterialUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _groupsRepository: GroupsRepository,
    private readonly _materialsRepository: MaterialsRepository,
  ) {}

  async execute({
    authenticateId,
    groupId,
    code,
    name,
    description,
    unit,
    active,
  }: CreateMaterialUseCaseRequest): Promise<CreateMaterialUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    const group = await this._groupsRepository.findById(
      user.companyId.toString(),
      groupId,
    );
    if (!group) return left(new GroupNotFoundError());

    const existingMaterial = await this._materialsRepository.findByName(
      user.companyId.toString(),
      name,
    );
    if (existingMaterial) return left(new AlreadyExistsMaterialError('name'));

    const materialCode = await this._materialsRepository.findByCode(
      user.companyId.toString(),
      code,
    );
    if (materialCode) return left(new AlreadyExistsMaterialError('code'));

    let unitMeasure: UnitMeasure;
    try {
      unitMeasure = UnitMeasure.fromCode(unit);
    } catch {
      return left(new InvalidUnitMeasureError());
    }

    const material = Material.create({
      companyId: user.companyId,
      groupId: group.id,
      code,
      name,
      description,
      unit: unitMeasure,
      active,
    });

    await this._materialsRepository.create(material);

    return right({ material });
  }
}
