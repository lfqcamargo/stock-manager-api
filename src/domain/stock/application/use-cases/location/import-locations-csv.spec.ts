import { makeUser } from 'test/factories/make-user';
import { InMemoryLocationsRepository } from 'test/repositories/in-memory-locations-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { InvalidCsvFormatError } from '@/domain/shared/csv/errors/invalid-csv-format-error';
import { InvalidImportModeError } from '@/domain/shared/csv/errors/invalid-import-mode-error';
import { ImportMode } from '@/domain/shared/csv/import-mode';
import { Location } from '@/domain/stock/enterprise/entities/location';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { ImportLocationsCsvUseCase } from './import-locations-csv';

let usersRepository: InMemoryUsersRepository;
let locationsRepository: InMemoryLocationsRepository;
let sut: ImportLocationsCsvUseCase;

describe('ImportLocationsCsv Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    locationsRepository = new InMemoryLocationsRepository();
    sut = new ImportLocationsCsvUseCase(usersRepository, locationsRepository);
  });

  it('should return UserNotFoundError when user does not exist', async () => {
    const result = await sut.execute({
      authenticateId: 'nonexistent',
      mode: ImportMode.ADD_NEW,
      rows: [{ code: 'L1', name: 'Location 1' }],
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
      rows: [{ code: 'L1', name: 'Location 1' }],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return InvalidImportModeError for unknown mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: 'INVALID',
      rows: [{ code: 'L1', name: 'Location 1' }],
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
      rows: [{ name: 'Location 1' } as any],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidCsvFormatError);
  });

  it('should import new locations with ADD_NEW mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [
        { code: 'L1', name: 'Location 1', description: 'Desc 1' },
        { code: 'L2', name: 'Location 2' },
      ],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.imported).toBe(2);
      expect(result.value.skipped).toBe(0);
    }
    expect(locationsRepository.items).toHaveLength(2);
  });

  it('should skip existing locations in ADD_NEW mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const existing = Location.create({
      companyId: user.companyId,
      code: 'L1',
      name: 'Old Name',
    });
    await locationsRepository.create(existing);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [{ code: 'L1', name: 'New Name' }],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.imported).toBe(0);
      expect(result.value.skipped).toBe(1);
    }
    expect(locationsRepository.items[0].name).toBe('Old Name');
  });

  it('should update existing locations in UPDATE_EXISTING mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const existing = Location.create({
      companyId: user.companyId,
      code: 'L1',
      name: 'Old Name',
    });
    await locationsRepository.create(existing);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.UPDATE_EXISTING,
      rows: [{ code: 'L1', name: 'Updated Name', description: 'New desc' }],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.imported).toBe(1);
      expect(result.value.skipped).toBe(0);
    }
    expect(locationsRepository.items[0].name).toBe('Updated Name');
    expect(locationsRepository.items[0].description).toBe('New desc');
  });

  it('should delete all and reimport in RESET mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    await locationsRepository.create(
      Location.create({ companyId: user.companyId, code: 'OLD', name: 'Old' }),
    );

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.RESET,
      rows: [{ code: 'NEW', name: 'New Location' }],
    });

    expect(result.isRight()).toBe(true);
    expect(locationsRepository.items).toHaveLength(1);
    expect(locationsRepository.items[0].code).toBe('NEW');
  });
});
