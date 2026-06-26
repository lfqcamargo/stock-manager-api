import { makePosition } from 'test/factories/make-position';
import { makeUser } from 'test/factories/make-user';
import { InMemoryPositionsRepository } from 'test/repositories/in-memory-positions-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { CreatePositionUseCase } from './create-position';
import { AlreadyExistsPositionError } from './errors/already-exists-position-error';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryPositionsRepository: InMemoryPositionsRepository;
let createPositionUseCase: CreatePositionUseCase;

describe('CreatePositionUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryPositionsRepository = new InMemoryPositionsRepository();

    createPositionUseCase = new CreatePositionUseCase(
      inMemoryUsersRepository,
      inMemoryPositionsRepository,
    );
  });

  it('should be able to create a position', async () => {
    const adminUser = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(adminUser);

    const result = await createPositionUseCase.execute({
      authenticateId: adminUser.id.toString(),
      code: 'POS-001',
      name: 'Position 1',
      description: 'Test Position',
    });

    expect(result.isRight()).toBe(true);
    const position = inMemoryPositionsRepository.items[0];

    expect(position).toBeDefined();
    expect(position.code).toBe('POS-001');
    expect(position.name).toBe('Position 1');
    expect(position.description).toBe('Test Position');
    expect(position.companyId.toString()).toBe(adminUser.companyId.toString());
  });

  it('should not create position if user is not found', async () => {
    const result = await createPositionUseCase.execute({
      authenticateId: 'non-existent-id',
      code: 'POS-001',
      name: 'Position 1',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should not create position if user is not admin or manager', async () => {
    const employee = makeUser({ role: UserRole.EMPLOYEE });
    await inMemoryUsersRepository.create(employee);

    const result = await createPositionUseCase.execute({
      authenticateId: employee.id.toString(),
      code: 'POS-001',
      name: 'Position 1',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should not create position if name already exists in company', async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(admin);

    const position = makePosition({
      companyId: admin.companyId,
      name: 'Position 1',
    });
    await inMemoryPositionsRepository.create(position);

    const result = await createPositionUseCase.execute({
      authenticateId: admin.id.toString(),
      code: 'POS-002',
      name: 'Position 1',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsPositionError);
  });

  it('should not create position if code already exists in company', async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(admin);

    const position = makePosition({
      companyId: admin.companyId,
      code: 'POS-001',
    });
    await inMemoryPositionsRepository.create(position);

    const result = await createPositionUseCase.execute({
      authenticateId: admin.id.toString(),
      code: 'POS-001',
      name: 'Another Position',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsPositionError);
  });
});
