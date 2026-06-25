import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { GroupsRepository } from '../../repositories/groups-repository';
import { MaterialsRepository } from '../../repositories/materials-repository';
import { MaterialActiveSystemError } from '../material/errors/material-active-system-error';
import { GroupNotFoundError } from './errors/group-not-found-error';

interface DeleteGroupUseCaseRequest {
  authenticateId: string;
  groupId: string;
}

type DeleteGroupUseCaseResponse = Either<
  | UserNotFoundError
  | UserNotAllowedError
  | GroupNotFoundError
  | MaterialActiveSystemError,
  void
>;

@Injectable()
export class DeleteGroupUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _groupsRepository: GroupsRepository,
    private readonly _materialsRepository: MaterialsRepository,
  ) {}

  async execute({
    authenticateId,
    groupId,
  }: DeleteGroupUseCaseRequest): Promise<DeleteGroupUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    const group = await this._groupsRepository.findById(groupId);
    if (!group || group.companyId.toString() !== user.companyId.toString())
      return left(new GroupNotFoundError());

    const materials = await this._materialsRepository.fetchByGroupId(
      user.companyId.toString(),
      groupId,
    );
    if (materials && materials?.length > 0)
      return left(new MaterialActiveSystemError());

    await this._groupsRepository.delete(groupId);

    return right(void 0);
  }
}
