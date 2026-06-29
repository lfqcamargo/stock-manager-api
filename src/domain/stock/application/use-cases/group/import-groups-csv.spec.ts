import { makeUser } from 'test/factories/make-user';
import { InMemoryGroupsRepository } from 'test/repositories/in-memory-groups-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { InvalidCsvFormatError } from '@/domain/shared/csv/errors/invalid-csv-format-error';
import { InvalidImportModeError } from '@/domain/shared/csv/errors/invalid-import-mode-error';
import { ImportMode } from '@/domain/shared/csv/import-mode';
import { Group } from '@/domain/stock/enterprise/entities/group';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { ImportGroupsCsvUseCase } from './import-groups-csv';

let usersRepository: InMemoryUsersRepository;
let groupsRepository: InMemoryGroupsRepository;
let sut: ImportGroupsCsvUseCase;

describe('ImportGroupsCsv Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    groupsRepository = new InMemoryGroupsRepository();
    sut = new ImportGroupsCsvUseCase(usersRepository, groupsRepository);
  });

  it('should return UserNotFoundError when user does not exist', async () => {
    const result = await sut.execute({
      authenticateId: 'nonexistent',
      mode: ImportMode.ADD_NEW,
      rows: [{ code: 'G1', name: 'Group 1' }],
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
      rows: [{ code: 'G1', name: 'Group 1' }],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return InvalidImportModeError for unknown mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: 'INVALID_MODE',
      rows: [{ code: 'G1', name: 'Group 1' }],
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
      rows: [{ name: 'Group 1' } as any],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidCsvFormatError);
  });

  it('should import new groups with ADD_NEW mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [
        { code: 'G1', name: 'Group 1', active: 'true' },
        { code: 'G2', name: 'Group 2', active: 'false' },
      ],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.imported).toBe(2);
      expect(result.value.skipped).toBe(0);
    }
    expect(groupsRepository.items).toHaveLength(2);
  });

  it('should skip existing groups in ADD_NEW mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const existing = Group.create({
      companyId: user.companyId,
      code: 'G1',
      name: 'Old Name',
      active: true,
    });
    await groupsRepository.create(existing);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [{ code: 'G1', name: 'New Name' }],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.imported).toBe(0);
      expect(result.value.skipped).toBe(1);
    }
    expect(groupsRepository.items[0].name).toBe('Old Name');
  });

  it('should update existing groups in UPDATE_EXISTING mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const existing = Group.create({
      companyId: user.companyId,
      code: 'G1',
      name: 'Old Name',
      active: true,
    });
    await groupsRepository.create(existing);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.UPDATE_EXISTING,
      rows: [{ code: 'G1', name: 'Updated Name', active: 'false' }],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.imported).toBe(1);
      expect(result.value.skipped).toBe(0);
    }
    expect(groupsRepository.items[0].name).toBe('Updated Name');
    expect(groupsRepository.items[0].active).toBe(false);
  });

  it('should delete all and reimport in RESET mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const existing = Group.create({
      companyId: user.companyId,
      code: 'OLD',
      name: 'Old Group',
      active: true,
    });
    await groupsRepository.create(existing);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.RESET,
      rows: [{ code: 'NEW', name: 'New Group' }],
    });

    expect(result.isRight()).toBe(true);
    expect(groupsRepository.items).toHaveLength(1);
    expect(groupsRepository.items[0].code).toBe('NEW');
  });

  it('should skip rows with empty required fields', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [
        { code: '', name: 'Group 1' },
        { code: 'G2', name: '' },
        { code: 'G3', name: 'Valid Group' },
      ],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.imported).toBe(1);
      expect(result.value.skipped).toBe(2);
    }
  });

  it('should work for MANAGER role', async () => {
    const user = makeUser({ role: UserRole.MANAGER });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [{ code: 'G1', name: 'Group 1' }],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) expect(result.value.imported).toBe(1);
  });

  it('should only import groups for the authenticated user company', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const otherCompanyGroup = Group.create({
      companyId: new UniqueEntityID(),
      code: 'G1',
      name: 'Other Company Group',
      active: true,
    });
    await groupsRepository.create(otherCompanyGroup);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [{ code: 'G1', name: 'My Group' }],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) expect(result.value.imported).toBe(1);
    expect(groupsRepository.items).toHaveLength(2);
  });
});
