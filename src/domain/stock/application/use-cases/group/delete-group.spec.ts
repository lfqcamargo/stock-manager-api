import { makeGroup } from 'test/factories/make-group';
import { makeMaterial } from 'test/factories/make-material';
import { makeUser } from 'test/factories/make-user';
import { InMemoryGroupsRepository } from 'test/repositories/in-memory-groups-repository';
import { InMemoryMaterialsRepository } from 'test/repositories/in-memory-materials-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { MaterialActiveSystemError } from '../material/errors/material-active-system-error';
import { DeleteGroupUseCase } from './delete-group';
import { GroupNotFoundError } from './errors/group-not-found-error';

let usersRepository: InMemoryUsersRepository;
let groupsRepository: InMemoryGroupsRepository;
let materialsRepository: InMemoryMaterialsRepository;
let sut: DeleteGroupUseCase;

describe('DeleteGroupUseCase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    groupsRepository = new InMemoryGroupsRepository();
    materialsRepository = new InMemoryMaterialsRepository();

    sut = new DeleteGroupUseCase(
      usersRepository,
      groupsRepository,
      materialsRepository,
    );
  });

  it('should delete a group successfully when user is admin', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const group = makeGroup({ companyId: user.companyId });
    await groupsRepository.create(group);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      groupId: group.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(groupsRepository.items).toHaveLength(0);
  });

  it('should delete a group successfully when user is manager', async () => {
    const user = makeUser({ role: UserRole.MANAGER });
    await usersRepository.create(user);

    const group = makeGroup({ companyId: user.companyId });
    await groupsRepository.create(group);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      groupId: group.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(groupsRepository.items).toHaveLength(0);
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await sut.execute({
      authenticateId: 'non-existent-user',
      groupId: 'any-group',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return UserNotAllowedError if user is not admin or manager', async () => {
    const user = makeUser({ role: UserRole.EMPLOYEE });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      groupId: 'any-group',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return GroupNotFoundError if group does not exist', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      groupId: 'non-existent-group',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(GroupNotFoundError);
  });

  it('should return MaterialActiveSystemError if group has active material', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const group = makeGroup({ companyId: user.companyId });
    await groupsRepository.create(group);

    await materialsRepository.create(
      makeMaterial({ companyId: user.companyId, groupId: group.id }),
    );

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      groupId: group.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(MaterialActiveSystemError);
  });
});
