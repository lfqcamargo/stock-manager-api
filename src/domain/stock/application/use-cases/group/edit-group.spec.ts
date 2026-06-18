import { makeGroup } from 'test/factories/make-group';
import { makeUser } from 'test/factories/make-user';
import { InMemoryGroupsRepository } from 'test/repositories/in-memory-groups-repository';
import { InMemoryMaterialsRepository } from 'test/repositories/in-memory-materials-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { EditGroupUseCase } from '../group/edit-group';
import { AlreadyExistsGroupError } from './errors/already-exists-group-error';
import { GroupNotFoundError } from './errors/group-not-found-error';

let usersRepository: InMemoryUsersRepository;
let groupsRepository: InMemoryGroupsRepository;
let materialsRepository: InMemoryMaterialsRepository;
let sut: EditGroupUseCase;

describe('EditGroupUseCase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    groupsRepository = new InMemoryGroupsRepository();
    materialsRepository = new InMemoryMaterialsRepository();

    sut = new EditGroupUseCase(
      usersRepository,
      groupsRepository,
      materialsRepository,
    );
  });

  it('should edit a group successfully when user is admin', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const group = makeGroup({ companyId: user.companyId, active: true });
    await groupsRepository.create(group);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      code: 'CODE',
      groupId: group.id.toString(),
      description: '',
      name: 'New Group Name',
      active: true,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.group.name).toBe('New Group Name');
      expect(result.value.group.active).toBe(true);
    }
  });

  it('should edit a group successfully when user is manager', async () => {
    const user = makeUser({ role: UserRole.MANAGER });
    await usersRepository.create(user);

    const group = makeGroup({ companyId: user.companyId, active: true });
    await groupsRepository.create(group);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      code: 'CODE',
      groupId: group.id.toString(),
      description: '',
      name: 'New Group Name',
      active: true,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.group.name).toBe('New Group Name');
      expect(result.value.group.active).toBe(true);
    }
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await sut.execute({
      code: 'CODE',
      authenticateId: 'non-existent-user',
      groupId: 'any-group',
      name: 'Name',
      description: '',
      active: true,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return UserNotAllowedError if user is not admin or manager', async () => {
    const user = makeUser({ role: UserRole.EMPLOYEE });
    await usersRepository.create(user);

    const result = await sut.execute({
      code: 'CODE',
      authenticateId: user.id.toString(),
      groupId: 'any-group',
      name: 'Name',
      description: '',
      active: true,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return GroupNotFoundError if group does not exist', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      code: 'CODE',
      authenticateId: user.id.toString(),
      groupId: 'non-existent-group',
      name: 'Name',
      description: '',
      active: true,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(GroupNotFoundError);
  });

  it('should return AlreadyExistsGroupError if new name already exists', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const group = makeGroup({ companyId: user.companyId, name: 'Group A' });
    const otherGroup = makeGroup({
      companyId: user.companyId,
      name: 'Group B',
    });

    await groupsRepository.create(group);
    await groupsRepository.create(otherGroup);

    const result = await sut.execute({
      code: 'CODE',
      authenticateId: user.id.toString(),
      groupId: group.id.toString(),
      name: 'Group B', // same name as other group
      description: '',
      active: true,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsGroupError);
  });
});
