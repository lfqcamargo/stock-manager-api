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
import { MaterialNotFoundError } from './errors/material-not-found-error';

interface EditMaterialUseCaseRequest {
  authenticateId: string;
  materialId: string;
  groupId: string;
  code: string;
  name: string;
  description: string | null;
  unit: string;
  active: boolean;
  photoUrl?: string | null;
}

type EditMaterialUseCaseResponse = Either<
  | UserNotFoundError
  | UserNotAllowedError
  | AlreadyExistsMaterialError
  | MaterialNotFoundError
  | GroupNotFoundError
  | InvalidUnitMeasureError,
  { material: Material }
>;

@Injectable()
export class EditMaterialUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _groupsRepository: GroupsRepository,
    private readonly _materialsRepository: MaterialsRepository,
  ) {}

  async execute({
    authenticateId,
    materialId,
    groupId,
    code,
    name,
    description,
    unit,
    active,
    photoUrl,
  }: EditMaterialUseCaseRequest): Promise<EditMaterialUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    const material = await this._materialsRepository.findById(materialId);
    if (
      !material ||
      material.companyId.toString() !== user.companyId.toString()
    )
      return left(new MaterialNotFoundError());

    if (material.groupId.toString() !== groupId) {
      const group = await this._groupsRepository.findById(groupId);
      if (!group || group.companyId.toString() !== user.companyId.toString())
        return left(new GroupNotFoundError());

      material.groupId = group.id;
    }

    if (material.code !== code) {
      const materialCode = await this._materialsRepository.findByCode(
        user.companyId.toString(),
        code,
      );
      if (materialCode) return left(new AlreadyExistsMaterialError('code'));

      material.code = code;
    }

    if (material.name !== name) {
      const materialName = await this._materialsRepository.findByName(
        user.companyId.toString(),
        name,
      );
      if (materialName) return left(new AlreadyExistsMaterialError('name'));

      material.name = name;
    }

    if (material.active !== active) material.active = active;

    let unitMeasure: UnitMeasure;
    try {
      unitMeasure = UnitMeasure.fromCode(unit);
      material.unit = unitMeasure;
    } catch {
      return left(new InvalidUnitMeasureError());
    }

    material.description = description;
    if (photoUrl !== undefined) {
      material.photoUrl = photoUrl;
    }
    await this._materialsRepository.update(material);

    return right({ material: material });
  }
}
