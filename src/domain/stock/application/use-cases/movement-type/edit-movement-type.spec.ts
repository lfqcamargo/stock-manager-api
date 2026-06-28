import { makeMovementType } from 'test/factories/make-movement-type';
import { makeUser } from 'test/factories/make-user';
import { InMemoryMovementTypesRepository } from 'test/repositories/in-memory-movement-types-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { MovementDirection } from '@/domain/stock/enterprise/entities/movement-type';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { EditMovementTypeUseCase } from './edit-movement-type';
import { AlreadyExistsMovementTypeError } from './errors/already-exists-movement-type-error';
import { MovementTypeNotFoundError } from './errors/movement-type-not-found-error';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryMovementTypesRepository: InMemoryMovementTypesRepository;
let sut: EditMovementTypeUseCase;

describe('EditMovementTypeUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryMovementTypesRepository = new InMemoryMovementTypesRepository();
    sut = new EditMovementTypeUseCase(
      inMemoryUsersRepository,
      inMemoryMovementTypesRepository,
    );
  });

  it('should edit a movement type successfully', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(user);

    const movementType = makeMovementType({
      companyId: user.companyId,
      name: 'Old Name',
      direction: MovementDirection.IN,
    });
    await inMemoryMovementTypesRepository.create(movementType);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      movementTypeId: movementType.id.toString(),
      name: 'New Name',
      direction: MovementDirection.OUT,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.movementType.name).toBe('New Name');
      expect(result.value.movementType.direction).toBe(MovementDirection.OUT);
    }
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await sut.execute({
      authenticateId: 'non-existent-id',
      movementTypeId: 'any-id',
      name: 'New Name',
      direction: MovementDirection.IN,
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
      name: 'New Name',
      direction: MovementDirection.IN,
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
      name: 'New Name',
      direction: MovementDirection.IN,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(MovementTypeNotFoundError);
  });

  it('should return AlreadyExistsMovementTypeError if new name already exists in the company', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(user);

    const existing = makeMovementType({
      companyId: user.companyId,
      name: 'Saída',
    });
    await inMemoryMovementTypesRepository.create(existing);

    const movementType = makeMovementType({
      companyId: user.companyId,
      name: 'Entrada',
    });
    await inMemoryMovementTypesRepository.create(movementType);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      movementTypeId: movementType.id.toString(),
      name: 'Saída',
      direction: MovementDirection.OUT,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsMovementTypeError);
  });
});
