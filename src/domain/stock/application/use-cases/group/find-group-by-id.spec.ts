import { GroupNotFoundError } from 'src/domain/stock/application/use-cases/group/errors/group-not-found-error';
import { makeGroup } from 'test/factories/make-group';
import { makeUser } from 'test/factories/make-user';
import { InMemoryGroupsRepository } from 'test/repositories/in-memory-groups-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { FindGroupByIdUseCase } from '@/domain/stock/application/use-cases/group/find-group-by-id';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

describe('FindGroupUseCase', () => {
  let usersRepository: InMemoryUsersRepository;
  let groupsRepository: InMemoryGroupsRepository;
  let findGroup: FindGroupByIdUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    groupsRepository = new InMemoryGroupsRepository();
    findGroup = new FindGroupByIdUseCase(usersRepository, groupsRepository);
  });

  it('should be able to find a group', async () => {
    const user = makeUser();
    await usersRepository.create(user);

    const group = makeGroup({ companyId: user.companyId, active: true });
    await groupsRepository.create(group);

    const result = await findGroup.execute({
      authenticateId: user.id.toString(),
      groupId: group.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({ group });
    expect(group.code).toBe(group.code);
    expect(group.name).toBe(group.name);
    expect(group.description).toBe(group.description);
    expect(group.active).toBe(true);
    expect(group.companyId.toString()).toBe(user.companyId.toString());
  });

  it('should return error if user does not exist', async () => {
    const result = await findGroup.execute({
      authenticateId: 'non-existent',
      groupId: 'any',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return error if group does not exist', async () => {
    const user = makeUser();
    await usersRepository.create(user);

    const result = await findGroup.execute({
      authenticateId: user.id.toString(),
      groupId: 'non-existent',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(GroupNotFoundError);
  });
});
