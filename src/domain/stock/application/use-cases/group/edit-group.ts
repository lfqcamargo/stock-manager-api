import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Group } from '../../../enterprise/entities/group';
import { GroupsRepository } from '../../repositories/groups-repository';
import { MaterialActiveSystemError } from '../material/errors/material-active-system-error';
import { AlreadyExistsGroupError } from './errors/already-exists-group-error';
import { GroupNotFoundError } from './errors/group-not-found-error';

interface EditGroupUseCaseRequest {
  authenticateId: string;
  groupId: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
  photoUrl?: string | null;
}

type EditGroupUseCaseResponse = Either<
  | UserNotFoundError
  | UserNotAllowedError
  | AlreadyExistsGroupError
  | GroupNotFoundError
  | MaterialActiveSystemError,
  { group: Group }
>;

@Injectable()
export class EditGroupUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _groupsRepository: GroupsRepository,
  ) {}

  async execute({
    authenticateId,
    groupId,
    code,
    name,
    description,
    active,
    photoUrl,
  }: EditGroupUseCaseRequest): Promise<EditGroupUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    const group = await this._groupsRepository.findById(
      user.companyId.toString(),
      groupId,
    );
    if (!group) return left(new GroupNotFoundError());

    if (group.code !== code) {
      const groupCode = await this._groupsRepository.findByCode(
        user.companyId.toString(),
        code,
      );
      if (groupCode) return left(new AlreadyExistsGroupError('Code'));

      group.code = code;
    }

    if (group.name !== name) {
      const groupName = await this._groupsRepository.findByName(
        user.companyId.toString(),
        name,
      );
      if (groupName) return left(new AlreadyExistsGroupError('Name'));

      group.name = name;
    }

    if (group.active !== active) group.active = active;

    group.description = description;
    if (photoUrl !== undefined) {
      group.photoUrl = photoUrl;
    }

    await this._groupsRepository.update(group);

    return right({ group: group });
  }
}
