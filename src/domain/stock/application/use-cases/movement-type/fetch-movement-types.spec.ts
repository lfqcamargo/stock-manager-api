import { makeMovementType } from 'test/factories/make-movement-type';
import { makeUser } from 'test/factories/make-user';
import { InMemoryMovementTypesRepository } from 'test/repositories/in-memory-movement-types-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { MovementDirection } from '@/domain/stock/enterprise/entities/movement-type';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { FetchMovementTypesUseCase } from './fetch-movement-types';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryMovementTypesRepository: InMemoryMovementTypesRepository;
let sut: FetchMovementTypesUseCase;

describe('FetchMovementTypesUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryMovementTypesRepository = new InMemoryMovementTypesRepository();
    sut = new FetchMovementTypesUseCase(
      inMemoryUsersRepository,
      inMemoryMovementTypesRepository,
    );
  });

  it('should paginate movement types and return correct meta data', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const totalItems = 25;
    const itemsPerPage = 10;
    const page = 2;

    for (let i = 0; i < totalItems; i++) {
      await inMemoryMovementTypesRepository.create(
        makeMovementType({
          companyId: user.companyId,
          direction: MovementDirection.IN,
        }),
      );
    }

    const result = await sut.execute({
      authenticatedId: user.id.toString(),
      page,
      itemsPerPage,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const { movementTypes, meta } = result.value;

      expect(movementTypes).toHaveLength(itemsPerPage);
      expect(meta.totalItems).toBe(totalItems);
      expect(meta.itemsPerPage).toBe(itemsPerPage);
      expect(meta.currentPage).toBe(page);
      expect(meta.totalPages).toBe(Math.ceil(totalItems / itemsPerPage));
      expect(meta.itemCount).toBe(itemsPerPage);
    }
  });

  it('should return an empty list when no movement types exist', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const result = await sut.execute({
      authenticatedId: user.id.toString(),
      page: 1,
      itemsPerPage: 10,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.movementTypes).toHaveLength(0);
      expect(result.value.meta.totalItems).toBe(0);
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
