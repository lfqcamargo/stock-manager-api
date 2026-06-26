import { makeRow } from 'test/factories/make-row';
import { makeUser } from 'test/factories/make-user';
import { InMemoryRowsRepository } from 'test/repositories/in-memory-rows-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { CreateRowUseCase } from './create-row';
import { AlreadyExistsRowError } from './errors/already-exists-row-error';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryRowsRepository: InMemoryRowsRepository;
let createRowUseCase: CreateRowUseCase;

describe('CreateRowUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryRowsRepository = new InMemoryRowsRepository();

    createRowUseCase = new CreateRowUseCase(
      inMemoryUsersRepository,
      inMemoryRowsRepository,
    );
  });

  it('should be able to create a row', async () => {
    const adminUser = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(adminUser);

    const result = await createRowUseCase.execute({
      authenticateId: adminUser.id.toString(),
      code: 'ROW-001',
      name: 'Row 1',
      description: 'Test Row',
    });

    expect(result.isRight()).toBe(true);
    const row = inMemoryRowsRepository.items[0];

    expect(row).toBeDefined();
    expect(row.code).toBe('ROW-001');
    expect(row.name).toBe('Row 1');
    expect(row.description).toBe('Test Row');
    expect(row.companyId.toString()).toBe(adminUser.companyId.toString());
  });

  it('should not create row if user is not found', async () => {
    const result = await createRowUseCase.execute({
      authenticateId: 'non-existent-id',
      code: 'ROW-001',
      name: 'Row 1',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should not create row if user is not admin or manager', async () => {
    const employee = makeUser({ role: UserRole.EMPLOYEE });
    await inMemoryUsersRepository.create(employee);

    const result = await createRowUseCase.execute({
      authenticateId: employee.id.toString(),
      code: 'ROW-001',
      name: 'Row 1',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should not create row if name already exists in company', async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(admin);

    const row = makeRow({
      companyId: admin.companyId,
      name: 'Row 1',
    });
    await inMemoryRowsRepository.create(row);

    const result = await createRowUseCase.execute({
      authenticateId: admin.id.toString(),
      code: 'ROW-002',
      name: 'Row 1',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsRowError);
  });

  it('should not create row if code already exists in company', async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(admin);

    const row = makeRow({
      companyId: admin.companyId,
      code: 'ROW-001',
    });
    await inMemoryRowsRepository.create(row);

    const result = await createRowUseCase.execute({
      authenticateId: admin.id.toString(),
      code: 'ROW-001',
      name: 'Another Row',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsRowError);
  });
});
