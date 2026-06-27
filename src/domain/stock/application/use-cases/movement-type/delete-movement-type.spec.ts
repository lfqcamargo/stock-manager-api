import { makeMovementType } from 'test/factories/make-movement-type';
import { makeUser } from 'test/factories/make-user';
import { InMemoryMovementTypesRepository } from 'test/repositories/in-memory-movement-types-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { DeleteMovementTypeUseCase } from './delete-movement-type';
import { MovementTypeNotFoundError } from './errors/movement-type-not-found-error';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryMovementTypesRepository: InMemoryMovementTypesRepository;
let sut: DeleteMovementTypeUseCase;

describe('DeleteMovementTypeUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryMovementTypesRepository = new InMemoryMovementTypesRepository();
    sut = new DeleteMovementTypeUseCase(
      inMemoryUsersRepository,
      inMemoryMovementTypesRepository,
    );
  });

  it('should delete a movement type successfully', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(user);

    const movementType = makeMovementType({ companyId: user.companyId });
    await inMemoryMovementTypesRepository.create(movementType);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      movementTypeId: movementType.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryMovementTypesRepository.items).toHaveLength(0);
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await sut.execute({
      authenticateId: 'non-existent-id',
      movementTypeId: 'any-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return UserNotAllowedError if user is not admin or manager', async () => {
    const user = makeUser({ role: UserRole.EMPLOYEE });
    await inMemoryUsersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      movementTypeId: 'any-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return MovementTypeNotFoundError if movement type does not exist', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      movementTypeId: 'non-existent-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(MovementTypeNotFoundError);
  });
});
