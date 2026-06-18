import { makeGroup } from 'test/factories/make-group';
import { makeMaterial } from 'test/factories/make-material';
import { makeUser } from 'test/factories/make-user';
import { InMemoryGroupsRepository } from 'test/repositories/in-memory-groups-repository';
import { InMemoryMaterialsRepository } from 'test/repositories/in-memory-materials-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { GroupNotFoundError } from './errors/group-not-found-error';
import { FetchGroupsUseCase } from './fetch-groups';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryGroupsRepository: InMemoryGroupsRepository;
let inMemoryMaterialsRepository: InMemoryMaterialsRepository;
let sut: FetchGroupsUseCase;

describe('FetchGroupsUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryGroupsRepository = new InMemoryGroupsRepository();
    inMemoryMaterialsRepository = new InMemoryMaterialsRepository();
    sut = new FetchGroupsUseCase(
      inMemoryUsersRepository,
      inMemoryGroupsRepository,
    );
  });

  it('should paginate groups and return correct meta data', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const totalGroups = 25;
    const itemsPerPage = 10;
    const page = 2;
    const materialPerGrupo = 2;
    let active = false;

    for (let i = 0; i < totalGroups; i++) {
      active = !active;
      const group = makeGroup({ companyId: user.companyId, active: active });
      await inMemoryGroupsRepository.create(group);

      for (let c = 0; c < materialPerGrupo; c++) {
        await inMemoryMaterialsRepository.create(
          makeMaterial({ companyId: group.companyId, groupId: group.id }),
        );
      }
    }

    const result = await sut.execute({
      authenticatedId: user.id.toString(),
      page,
      itemsPerPage,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const { groups, meta } = result.value;

      expect(groups).toHaveLength(itemsPerPage);

      expect(meta.totalItems).toBe(totalGroups);
      expect(meta.itemsPerPage).toBe(itemsPerPage);
      expect(meta.currentPage).toBe(page);
      expect(meta.totalPages).toBe(Math.ceil(totalGroups / itemsPerPage));
      expect(meta.itemCount).toBe(itemsPerPage);
      expect(meta.totalActiveGroups).toBe(Math.ceil(totalGroups / 2));
    }
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await sut.execute({
      authenticatedId: 'non-existent-user-id',
      page: 1,
      itemsPerPage: 10,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return GroupNotFoundError if group does not exist', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const result = await sut.execute({
      authenticatedId: user.id.toString(),
      page: 1,
      itemsPerPage: 10,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(GroupNotFoundError);
  });
});
