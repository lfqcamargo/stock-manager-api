import { makeGroup } from 'test/factories/make-group';
import { makeMaterial } from 'test/factories/make-material';
import { makeUser } from 'test/factories/make-user';
import { InMemoryGroupsRepository } from 'test/repositories/in-memory-groups-repository';
import { InMemoryMaterialsRepository } from 'test/repositories/in-memory-materials-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { FetchMaterialsUseCase } from './fetch-materials';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryGroupsRepository: InMemoryGroupsRepository;
let inMemoryMaterialsRepository: InMemoryMaterialsRepository;
let sut: FetchMaterialsUseCase;

describe('FetchMaterialsUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryGroupsRepository = new InMemoryGroupsRepository();
    inMemoryMaterialsRepository = new InMemoryMaterialsRepository();
    sut = new FetchMaterialsUseCase(
      inMemoryUsersRepository,
      inMemoryMaterialsRepository,
    );
  });

  it('should paginate materials and return correct meta data', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const group = makeGroup({ companyId: user.companyId });
    await inMemoryGroupsRepository.create(group);
    const totalMaterials = 25;
    const itemsPerPage = 10;
    const page = 2;

    for (let i = 0; i < totalMaterials; i++) {
      await inMemoryMaterialsRepository.create(
        makeMaterial({ companyId: user.companyId, groupId: group.id }),
      );
    }

    const result = await sut.execute({
      authenticatedId: user.id.toString(),
      page,
      itemsPerPage,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const { materials, meta } = result.value;

      expect(materials).toHaveLength(itemsPerPage);

      expect(meta.totalItems).toBe(totalMaterials);
      expect(meta.itemsPerPage).toBe(itemsPerPage);
      expect(meta.currentPage).toBe(page);
      expect(meta.totalPages).toBe(Math.ceil(totalMaterials / itemsPerPage));
      expect(meta.itemCount).toBe(itemsPerPage);
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
});
