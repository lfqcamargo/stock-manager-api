import { makeLocation } from 'test/factories/make-location';
import { makeUser } from 'test/factories/make-user';
import { InMemoryLocationsRepository } from 'test/repositories/in-memory-locations-repository';
import { InMemorySubLocationsRepository } from 'test/repositories/in-memory-sub-locations-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { InvalidCsvFormatError } from '@/domain/shared/csv/errors/invalid-csv-format-error';
import { InvalidImportModeError } from '@/domain/shared/csv/errors/invalid-import-mode-error';
import { ImportMode } from '@/domain/shared/csv/import-mode';
import { SubLocation } from '@/domain/stock/enterprise/entities/sub-location';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { ImportSubLocationsCsvUseCase } from './import-sub-locations-csv';

let usersRepository: InMemoryUsersRepository;
let locationsRepository: InMemoryLocationsRepository;
let subLocationsRepository: InMemorySubLocationsRepository;
let sut: ImportSubLocationsCsvUseCase;

describe('ImportSubLocationsCsv Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    locationsRepository = new InMemoryLocationsRepository();
    subLocationsRepository = new InMemorySubLocationsRepository(
      locationsRepository,
    );
    sut = new ImportSubLocationsCsvUseCase(
      usersRepository,
      locationsRepository,
      subLocationsRepository,
    );
  });

  it('should return UserNotFoundError when user does not exist', async () => {
    const result = await sut.execute({
      authenticateId: 'nonexistent',
      mode: ImportMode.ADD_NEW,
      rows: [{ locationCode: 'L1', code: 'SL1', name: 'Sub 1' }],
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
      rows: [{ locationCode: 'L1', code: 'SL1', name: 'Sub 1' }],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return InvalidImportModeError for unknown mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: 'BAD',
      rows: [{ locationCode: 'L1', code: 'SL1', name: 'Sub 1' }],
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
      rows: [{ code: 'SL1', name: 'Sub 1' } as any],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidCsvFormatError);
  });

  it('should skip rows where location does not exist', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [{ locationCode: 'NONEXISTENT', code: 'SL1', name: 'Sub 1' }],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.imported).toBe(0);
      expect(result.value.skipped).toBe(1);
    }
  });

  it('should import sub-locations linked to existing locations', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const location = makeLocation({ companyId: user.companyId, code: 'L1' });
    await locationsRepository.create(location);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [
        { locationCode: 'L1', code: 'SL1', name: 'Sub 1' },
        { locationCode: 'L1', code: 'SL2', name: 'Sub 2', description: 'Desc' },
      ],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.imported).toBe(2);
      expect(result.value.skipped).toBe(0);
    }
    expect(subLocationsRepository.items).toHaveLength(2);
  });

  it('should skip existing sub-locations in ADD_NEW mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const location = makeLocation({ companyId: user.companyId, code: 'L1' });
    await locationsRepository.create(location);

    const existing = SubLocation.create({
      companyId: user.companyId,
      locationId: location.id,
      code: 'SL1',
      name: 'Old Name',
    });
    await subLocationsRepository.create(existing);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [{ locationCode: 'L1', code: 'SL1', name: 'New Name' }],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) expect(result.value.skipped).toBe(1);
    expect(subLocationsRepository.items[0].name).toBe('Old Name');
  });

  it('should update existing sub-locations in UPDATE_EXISTING mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const location = makeLocation({ companyId: user.companyId, code: 'L1' });
    await locationsRepository.create(location);

    const existing = SubLocation.create({
      companyId: user.companyId,
      locationId: location.id,
      code: 'SL1',
      name: 'Old Name',
    });
    await subLocationsRepository.create(existing);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.UPDATE_EXISTING,
      rows: [{ locationCode: 'L1', code: 'SL1', name: 'Updated Name' }],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) expect(result.value.imported).toBe(1);
    expect(subLocationsRepository.items[0].name).toBe('Updated Name');
  });

  it('should delete all and reimport in RESET mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const location = makeLocation({ companyId: user.companyId, code: 'L1' });
    await locationsRepository.create(location);

    const existing = SubLocation.create({
      companyId: user.companyId,
      locationId: location.id,
      code: 'OLD',
      name: 'Old Sub',
    });
    await subLocationsRepository.create(existing);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.RESET,
      rows: [{ locationCode: 'L1', code: 'NEW', name: 'New Sub' }],
    });

    expect(result.isRight()).toBe(true);
    expect(subLocationsRepository.items).toHaveLength(1);
    expect(subLocationsRepository.items[0].code).toBe('NEW');
  });
});
