import { makeRow } from 'test/factories/make-row';
import { makeUser } from 'test/factories/make-user';
import { InMemoryRowsRepository } from 'test/repositories/in-memory-rows-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { EditRowUseCase } from './edit-row';
import { AlreadyExistsRowError } from './errors/already-exists-row-error';
import { RowNotFoundError } from './errors/row-not-found-error';

let usersRepository: InMemoryUsersRepository;
let rowsRepository: InMemoryRowsRepository;
let editRowUseCase: EditRowUseCase;

describe('EditRowUseCase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    rowsRepository = new InMemoryRowsRepository();

    editRowUseCase = new EditRowUseCase(usersRepository, rowsRepository);
  });

  it('should edit a row successfully', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const row = makeRow({
      companyId: user.companyId,
      code: 'OLD-001',
      name: 'Old Name',
    });
    await rowsRepository.create(row);

    const result = await editRowUseCase.execute({
      authenticateId: user.id.toString(),
      rowId: row.id.toString(),
      code: 'NEW-001',
      name: 'New Name',
      description: 'New Description',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.row.name).toBe('New Name');
      expect(result.value.row.code).toBe('NEW-001');
      expect(result.value.row.description).toBe('New Description');
    }
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await editRowUseCase.execute({
      authenticateId: 'non-existent-user',
      rowId: 'any-row',
      code: 'NEW-001',
      name: 'New Name',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return UserNotAllowedError if user is not admin or manager', async () => {
    const user = makeUser({ role: UserRole.EMPLOYEE });
    await usersRepository.create(user);

    const result = await editRowUseCase.execute({
      authenticateId: user.id.toString(),
      rowId: 'any-row',
      code: 'NEW-001',
      name: 'New Name',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return RowNotFoundError if row does not exist', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await editRowUseCase.execute({
      authenticateId: user.id.toString(),
      rowId: 'non-existent-row',
      code: 'NEW-001',
      name: 'New Name',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(RowNotFoundError);
  });

  it('should return AlreadyExistsRowError if name already exists', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const row1 = makeRow({
      companyId: user.companyId,
      code: 'ROW-001',
      name: 'Row 1',
    });
    const row2 = makeRow({
      companyId: user.companyId,
      code: 'ROW-002',
      name: 'Row 2',
    });

    await rowsRepository.create(row1);
    await rowsRepository.create(row2);

    const result = await editRowUseCase.execute({
      authenticateId: user.id.toString(),
      rowId: row1.id.toString(),
      code: 'ROW-001',
      name: 'Row 2',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsRowError);
  });

  it('should return AlreadyExistsRowError if code already exists', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const row1 = makeRow({
      companyId: user.companyId,
      code: 'ROW-001',
      name: 'Row 1',
    });
    const row2 = makeRow({
      companyId: user.companyId,
      code: 'ROW-002',
      name: 'Row 2',
    });

    await rowsRepository.create(row1);
    await rowsRepository.create(row2);

    const result = await editRowUseCase.execute({
      authenticateId: user.id.toString(),
      rowId: row1.id.toString(),
      code: 'ROW-002',
      name: 'Row 1',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsRowError);
  });
});
