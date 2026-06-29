import { makeMovementType } from 'test/factories/make-movement-type';
import { makeUser } from 'test/factories/make-user';
import { InMemoryMovementTypesRepository } from 'test/repositories/in-memory-movement-types-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { InvalidCsvFormatError } from '@/domain/shared/csv/errors/invalid-csv-format-error';
import { InvalidImportModeError } from '@/domain/shared/csv/errors/invalid-import-mode-error';
import { ImportMode } from '@/domain/shared/csv/import-mode';
import { MovementDirection } from '@/domain/stock/enterprise/entities/movement-type';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { ImportMovementTypesCsvUseCase } from './import-movement-types-csv';

let usersRepository: InMemoryUsersRepository;
let movementTypesRepository: InMemoryMovementTypesRepository;
let sut: ImportMovementTypesCsvUseCase;

describe('ImportMovementTypesCsv Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    movementTypesRepository = new InMemoryMovementTypesRepository();
    sut = new ImportMovementTypesCsvUseCase(
      usersRepository,
      movementTypesRepository,
    );
  });

  it('should return UserNotFoundError when user does not exist', async () => {
    const result = await sut.execute({
      authenticateId: 'nonexistent',
      mode: ImportMode.ADD_NEW,
      rows: [{ name: 'Entry', direction: 'IN' }],
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
      rows: [{ name: 'Entry', direction: 'IN' }],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return InvalidImportModeError for unknown mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: 'BADMODE',
      rows: [{ name: 'Entry', direction: 'IN' }],
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

  it('should return InvalidCsvFormatError when required column is missing', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [{ name: 'Entry' } as any],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidCsvFormatError);
  });

  it('should import movement types with ADD_NEW mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [
        { name: 'Entry', direction: 'IN' },
        { name: 'Exit', direction: 'OUT' },
      ],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.imported).toBe(2);
      expect(result.value.skipped).toBe(0);
    }
  });

  it('should skip rows with invalid direction', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [
        { name: 'Entry', direction: 'IN' },
        { name: 'BadOne', direction: 'INVALID' },
      ],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.imported).toBe(1);
      expect(result.value.skipped).toBe(1);
    }
  });

  it('should skip existing movement types in ADD_NEW mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const existing = makeMovementType({
      companyId: user.companyId,
      name: 'Entry',
      direction: MovementDirection.IN,
    });
    await movementTypesRepository.create(existing);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [{ name: 'Entry', direction: 'OUT' }],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) expect(result.value.skipped).toBe(1);
    expect(movementTypesRepository.items[0].direction).toBe(
      MovementDirection.IN,
    );
  });

  it('should update existing movement types in UPDATE_EXISTING mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const existing = makeMovementType({
      companyId: user.companyId,
      name: 'Entry',
      direction: MovementDirection.IN,
    });
    await movementTypesRepository.create(existing);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.UPDATE_EXISTING,
      rows: [{ name: 'Entry', direction: 'OUT' }],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) expect(result.value.imported).toBe(1);
    expect(movementTypesRepository.items[0].direction).toBe(
      MovementDirection.OUT,
    );
  });

  it('should delete all and reimport in RESET mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const existing = makeMovementType({
      companyId: user.companyId,
      name: 'OldType',
      direction: MovementDirection.IN,
    });
    await movementTypesRepository.create(existing);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.RESET,
      rows: [{ name: 'NewType', direction: 'OUT' }],
    });

    expect(result.isRight()).toBe(true);
    expect(movementTypesRepository.items).toHaveLength(1);
    expect(movementTypesRepository.items[0].name).toBe('NewType');
  });
});
