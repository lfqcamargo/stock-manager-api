import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Group } from '../../../enterprise/entities/group';
import { GroupsRepository } from '../../repositories/groups-repository';
import { GroupNotFoundError } from './errors/group-not-found-error';

interface FindGroupUseCaseRequest {
  authenticateId: string;
  groupId: string;
}

type FindGroupUseCaseResponse = Either<
  UserNotFoundError | GroupNotFoundError,
  { group: Group }
>;

@Injectable()
export class FindGroupByIdUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _groupsRepository: GroupsRepository,
  ) {}

  async execute({
    authenticateId,
    groupId,
  }: FindGroupUseCaseRequest): Promise<FindGroupUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());

    const group = await this._groupsRepository.findById(
      user.companyId.toString(),
      groupId,
    );
    if (!group) return left(new GroupNotFoundError());

    return right({ group: group });
  }
}
