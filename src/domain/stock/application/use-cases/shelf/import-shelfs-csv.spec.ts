import { makeUser } from 'test/factories/make-user';
import { InMemoryShelfsRepository } from 'test/repositories/in-memory-shelfs-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { InvalidCsvFormatError } from '@/domain/shared/csv/errors/invalid-csv-format-error';
import { InvalidImportModeError } from '@/domain/shared/csv/errors/invalid-import-mode-error';
import { ImportMode } from '@/domain/shared/csv/import-mode';
import { Shelf } from '@/domain/stock/enterprise/entities/shelf';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { ImportShelfsCsvUseCase } from './import-shelfs-csv';

let usersRepository: InMemoryUsersRepository;
let shelfsRepository: InMemoryShelfsRepository;
let sut: ImportShelfsCsvUseCase;

describe('ImportShelfsCsv Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    shelfsRepository = new InMemoryShelfsRepository();
    sut = new ImportShelfsCsvUseCase(usersRepository, shelfsRepository);
  });

  it('should return UserNotFoundError when user does not exist', async () => {
    const result = await sut.execute({
      authenticateId: 'nonexistent',
      mode: ImportMode.ADD_NEW,
      rows: [{ code: 'S1', name: 'Shelf 1' }],
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
      rows: [{ code: 'S1', name: 'Shelf 1' }],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return InvalidImportModeError for unknown mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: 'WRONG',
      rows: [{ code: 'S1', name: 'Shelf 1' }],
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

  it('should import shelfs with ADD_NEW mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [
        { code: 'S1', name: 'Shelf 1' },
        { code: 'S2', name: 'Shelf 2' },
      ],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) expect(result.value.imported).toBe(2);
  });

  it('should skip existing shelfs in ADD_NEW mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    await shelfsRepository.create(
      Shelf.create({ companyId: user.companyId, code: 'S1', name: 'Old' }),
    );

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [{ code: 'S1', name: 'New' }],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) expect(result.value.skipped).toBe(1);
    expect(shelfsRepository.items[0].name).toBe('Old');
  });

  it('should update existing shelfs in UPDATE_EXISTING mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    await shelfsRepository.create(
      Shelf.create({ companyId: user.companyId, code: 'S1', name: 'Old' }),
    );

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.UPDATE_EXISTING,
      rows: [{ code: 'S1', name: 'Updated' }],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) expect(result.value.imported).toBe(1);
    expect(shelfsRepository.items[0].name).toBe('Updated');
  });

  it('should clear all and reimport in RESET mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    await shelfsRepository.create(
      Shelf.create({ companyId: user.companyId, code: 'OLD', name: 'Old' }),
    );

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.RESET,
      rows: [{ code: 'NEW', name: 'New Shelf' }],
    });

    expect(result.isRight()).toBe(true);
    expect(shelfsRepository.items).toHaveLength(1);
    expect(shelfsRepository.items[0].code).toBe('NEW');
  });
});
