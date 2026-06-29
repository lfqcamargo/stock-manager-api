import { makeUser } from 'test/factories/make-user';
import { InMemoryPositionsRepository } from 'test/repositories/in-memory-positions-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { InvalidCsvFormatError } from '@/domain/shared/csv/errors/invalid-csv-format-error';
import { InvalidImportModeError } from '@/domain/shared/csv/errors/invalid-import-mode-error';
import { ImportMode } from '@/domain/shared/csv/import-mode';
import { Position } from '@/domain/stock/enterprise/entities/position';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { ImportPositionsCsvUseCase } from './import-positions-csv';

let usersRepository: InMemoryUsersRepository;
let positionsRepository: InMemoryPositionsRepository;
let sut: ImportPositionsCsvUseCase;

describe('ImportPositionsCsv Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    positionsRepository = new InMemoryPositionsRepository();
    sut = new ImportPositionsCsvUseCase(usersRepository, positionsRepository);
  });

  it('should return UserNotFoundError when user does not exist', async () => {
    const result = await sut.execute({
      authenticateId: 'nonexistent',
      mode: ImportMode.ADD_NEW,
      rows: [{ code: 'P1', name: 'Position 1' }],
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
      rows: [{ code: 'P1', name: 'Position 1' }],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return InvalidImportModeError for unknown mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: 'NOPE',
      rows: [{ code: 'P1', name: 'Position 1' }],
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

  it('should import positions with ADD_NEW mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [
        { code: 'P1', name: 'Position 1' },
        { code: 'P2', name: 'Position 2' },
      ],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) expect(result.value.imported).toBe(2);
  });

  it('should skip existing positions in ADD_NEW mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    await positionsRepository.create(
      Position.create({ companyId: user.companyId, code: 'P1', name: 'Old' }),
    );

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [{ code: 'P1', name: 'New' }],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) expect(result.value.skipped).toBe(1);
    expect(positionsRepository.items[0].name).toBe('Old');
  });

  it('should update existing positions in UPDATE_EXISTING mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    await positionsRepository.create(
      Position.create({ companyId: user.companyId, code: 'P1', name: 'Old' }),
    );

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.UPDATE_EXISTING,
      rows: [{ code: 'P1', name: 'Updated' }],
    });

    expect(result.isRight()).toBe(true);
    expect(positionsRepository.items[0].name).toBe('Updated');
  });

  it('should clear all and reimport in RESET mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    await positionsRepository.create(
      Position.create({ companyId: user.companyId, code: 'OLD', name: 'Old' }),
    );

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.RESET,
      rows: [{ code: 'NEW', name: 'New Position' }],
    });

    expect(result.isRight()).toBe(true);
    expect(positionsRepository.items).toHaveLength(1);
    expect(positionsRepository.items[0].code).toBe('NEW');
  });
});
