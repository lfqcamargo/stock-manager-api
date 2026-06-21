import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Group } from '../../../enterprise/entities/group';
import { GroupsRepository } from '../../repositories/groups-repository';
import { AlreadyExistsGroupError } from './errors/already-exists-group-error';

interface CreateGroupUseCaseRequest {
  authenticateId: string;
  code: string;
  name: string;
  description?: string;
  active: boolean;
  photoUrl?: string | null;
}

type CreateGroupUseCaseResponse = Either<
  UserNotFoundError | UserNotAllowedError | AlreadyExistsGroupError,
  { group: Group }
>;

@Injectable()
export class CreateGroupUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _groupsRepository: GroupsRepository,
  ) {}

  async execute({
    authenticateId,
    code,
    name,
    description,
    active,
    photoUrl,
  }: CreateGroupUseCaseRequest): Promise<CreateGroupUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    const groupName = await this._groupsRepository.findByName(
      user.companyId.toString(),
      name,
    );
    if (groupName) return left(new AlreadyExistsGroupError('Name'));

    const groupCode = await this._groupsRepository.findByCode(
      user.companyId.toString(),
      code,
    );
    if (groupCode) return left(new AlreadyExistsGroupError('Code'));

    const group = Group.create({
      companyId: user.companyId,
      code: code.toUpperCase(),
      name,
      description,
      active,
      photoUrl,
    });

    await this._groupsRepository.create(group);

    return right({ group: group });
  }
}
