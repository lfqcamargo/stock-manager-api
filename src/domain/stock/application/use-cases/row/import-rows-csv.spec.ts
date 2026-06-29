import { makeUser } from 'test/factories/make-user';
import { InMemoryRowsRepository } from 'test/repositories/in-memory-rows-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { InvalidCsvFormatError } from '@/domain/shared/csv/errors/invalid-csv-format-error';
import { InvalidImportModeError } from '@/domain/shared/csv/errors/invalid-import-mode-error';
import { ImportMode } from '@/domain/shared/csv/import-mode';
import { Row } from '@/domain/stock/enterprise/entities/row';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { ImportRowsCsvUseCase } from './import-rows-csv';

let usersRepository: InMemoryUsersRepository;
let rowsRepository: InMemoryRowsRepository;
let sut: ImportRowsCsvUseCase;

describe('ImportRowsCsv Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    rowsRepository = new InMemoryRowsRepository();
    sut = new ImportRowsCsvUseCase(usersRepository, rowsRepository);
  });

  it('should return UserNotFoundError when user does not exist', async () => {
    const result = await sut.execute({
      authenticateId: 'nonexistent',
      mode: ImportMode.ADD_NEW,
      rows: [{ code: 'R1', name: 'Row 1' }],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return UserNotAllowedError when user is EMPLOYEE', async () => {
    const user = makeUser({ role: UserRole.EMPLOYEE });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [{ code: 'R1', name: 'Row 1' }],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return InvalidImportModeError for unknown mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: 'BAD_MODE',
      rows: [{ code: 'R1', name: 'Row 1' }],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidImportModeError);
  });

  it('should return InvalidCsvFormatError when rows is empty', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidCsvFormatError);
  });

  it('should import rows with ADD_NEW mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [
        { code: 'R1', name: 'Row 1' },
        { code: 'R2', name: 'Row 2', description: 'Desc' },
      ],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.imported).toBe(2);
      expect(result.value.skipped).toBe(0);
    }
  });

  it('should skip existing rows in ADD_NEW mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    await rowsRepository.create(
      Row.create({ companyId: user.companyId, code: 'R1', name: 'Old' }),
    );

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [{ code: 'R1', name: 'New' }],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.skipped).toBe(1);
      expect(result.value.imported).toBe(0);
    }
    expect(rowsRepository.items[0].name).toBe('Old');
  });

  it('should update existing rows in UPDATE_EXISTING mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    await rowsRepository.create(
      Row.create({ companyId: user.companyId, code: 'R1', name: 'Old' }),
    );

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.UPDATE_EXISTING,
      rows: [{ code: 'R1', name: 'Updated' }],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) expect(result.value.imported).toBe(1);
    expect(rowsRepository.items[0].name).toBe('Updated');
  });

  it('should clear all rows and reimport in RESET mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    await rowsRepository.create(
      Row.create({ companyId: user.companyId, code: 'OLD', name: 'Old Row' }),
    );

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.RESET,
      rows: [{ code: 'NEW', name: 'New Row' }],
    });

    expect(result.isRight()).toBe(true);
    expect(rowsRepository.items).toHaveLength(1);
    expect(rowsRepository.items[0].code).toBe('NEW');
  });
});
