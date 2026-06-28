import { makeMovementType } from 'test/factories/make-movement-type';
import { makeUser } from 'test/factories/make-user';
import { InMemoryMovementTypesRepository } from 'test/repositories/in-memory-movement-types-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { MovementTypeNotFoundError } from './errors/movement-type-not-found-error';
import { FindMovementTypeByIdUseCase } from './find-movement-type-by-id';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryMovementTypesRepository: InMemoryMovementTypesRepository;
let sut: FindMovementTypeByIdUseCase;

describe('FindMovementTypeByIdUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryMovementTypesRepository = new InMemoryMovementTypesRepository();
    sut = new FindMovementTypeByIdUseCase(
      inMemoryUsersRepository,
      inMemoryMovementTypesRepository,
    );
  });

  it('should find a movement type by id successfully', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const movementType = makeMovementType({ companyId: user.companyId });
    await inMemoryMovementTypesRepository.create(movementType);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      movementTypeId: movementType.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.movementType.id.toString()).toBe(
        movementType.id.toString(),
      );
    }
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await sut.execute({
      authenticateId: 'non-existent-id',
      movementTypeId: 'any-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return MovementTypeNotFoundError if movement type does not exist', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      movementTypeId: 'non-existent-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(MovementTypeNotFoundError);
  });
});
