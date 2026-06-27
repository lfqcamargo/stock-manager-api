import { makeMovement } from 'test/factories/make-movement';
import { makeUser } from 'test/factories/make-user';
import { InMemoryMovementsRepository } from 'test/repositories/in-memory-movements-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { FindMovementByIdUseCase } from './find-movement-by-id';
import { MovementNotFoundError } from './errors/movement-not-found-error';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryMovementsRepository: InMemoryMovementsRepository;
let sut: FindMovementByIdUseCase;

describe('FindMovementByIdUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryMovementsRepository = new InMemoryMovementsRepository();
    sut = new FindMovementByIdUseCase(
      inMemoryUsersRepository,
      inMemoryMovementsRepository,
    );
  });

  it('should find a movement by id successfully', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const movement = makeMovement({ companyId: user.companyId });
    await inMemoryMovementsRepository.create(movement);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      movementId: movement.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.movement.id.toString()).toBe(movement.id.toString());
    }
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await sut.execute({
      authenticateId: 'non-existent-id',
      movementId: 'any-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return MovementNotFoundError if movement does not exist', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      movementId: 'non-existent-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(MovementNotFoundError);
  });
});
