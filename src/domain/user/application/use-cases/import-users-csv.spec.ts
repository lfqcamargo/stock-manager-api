import { makeUser } from 'test/factories/make-user';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { InvalidCsvFormatError } from '@/domain/shared/csv/errors/invalid-csv-format-error';
import { InvalidImportModeError } from '@/domain/shared/csv/errors/invalid-import-mode-error';
import { ImportMode } from '@/domain/shared/csv/import-mode';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { ImportUsersCsvUseCase } from './import-users-csv';

let usersRepository: InMemoryUsersRepository;
let sut: ImportUsersCsvUseCase;

describe('ImportUsersCsv Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    sut = new ImportUsersCsvUseCase(usersRepository);
  });

  it('should return UserNotFoundError when user does not exist', async () => {
    const result = await sut.execute({
      authenticateId: 'nonexistent',
      mode: ImportMode.ADD_NEW,
      rows: [
        {
          name: 'John',
          email: 'j@test.com',
          password: '123456',
          role: 'EMPLOYEE',
        },
      ],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return UserNotAllowedError when user is MANAGER', async () => {
    const user = makeUser({ role: UserRole.MANAGER });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [
        {
          name: 'John',
          email: 'j@test.com',
          password: '123456',
          role: 'EMPLOYEE',
        },
      ],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return UserNotAllowedError when user is EMPLOYEE', async () => {
    const user = makeUser({ role: UserRole.EMPLOYEE });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [
        {
          name: 'John',
          email: 'j@test.com',
          password: '123456',
          role: 'EMPLOYEE',
        },
      ],
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
      rows: [
        {
          name: 'John',
          email: 'j@test.com',
          password: '123456',
          role: 'EMPLOYEE',
        },
      ],
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
      rows: [{ name: 'John', email: 'j@test.com', role: 'EMPLOYEE' } as any],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidCsvFormatError);
  });

  it('should import new users with ADD_NEW mode', async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(admin);

    const result = await sut.execute({
      authenticateId: admin.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [
        {
          name: 'Alice',
          email: 'alice@test.com',
          password: 'pass123',
          role: 'EMPLOYEE',
        },
        {
          name: 'Bob',
          email: 'bob@test.com',
          password: 'pass456',
          role: 'MANAGER',
          active: 'true',
        },
      ],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.imported).toBe(2);
      expect(result.value.skipped).toBe(0);
    }
    expect(usersRepository.items).toHaveLength(3);
  });

  it('should skip rows with invalid role', async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(admin);

    const result = await sut.execute({
      authenticateId: admin.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [
        {
          name: 'Alice',
          email: 'alice@test.com',
          password: 'pass123',
          role: 'SUPERUSER',
        },
      ],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.imported).toBe(0);
      expect(result.value.skipped).toBe(1);
    }
  });

  it('should skip existing users in ADD_NEW mode', async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(admin);

    const existing = makeUser({
      companyId: admin.companyId,
      email: 'alice@test.com',
      role: UserRole.EMPLOYEE,
    });
    await usersRepository.create(existing);

    const result = await sut.execute({
      authenticateId: admin.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [
        {
          name: 'New Alice',
          email: 'alice@test.com',
          password: 'pass',
          role: 'MANAGER',
        },
      ],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) expect(result.value.skipped).toBe(1);
    const alice = usersRepository.items.find(
      (u) => u.email === 'alice@test.com',
    );
    expect(alice?.role).toBe(UserRole.EMPLOYEE);
  });

  it('should update existing users in UPDATE_EXISTING mode', async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(admin);

    const existing = makeUser({
      companyId: admin.companyId,
      email: 'alice@test.com',
      role: UserRole.EMPLOYEE,
    });
    await usersRepository.create(existing);

    const result = await sut.execute({
      authenticateId: admin.id.toString(),
      mode: ImportMode.UPDATE_EXISTING,
      rows: [
        {
          name: 'Updated Alice',
          email: 'alice@test.com',
          password: 'pass',
          role: 'MANAGER',
        },
      ],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) expect(result.value.imported).toBe(1);
    const alice = usersRepository.items.find(
      (u) => u.email === 'alice@test.com',
    );
    expect(alice?.role).toBe(UserRole.MANAGER);
    expect(alice?.name).toBe('Updated Alice');
  });

  it('should delete all company users and reimport in RESET mode', async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(admin);

    const existing = makeUser({
      companyId: admin.companyId,
      email: 'old@test.com',
      role: UserRole.EMPLOYEE,
    });
    await usersRepository.create(existing);

    const result = await sut.execute({
      authenticateId: admin.id.toString(),
      mode: ImportMode.RESET,
      rows: [
        {
          name: 'New User',
          email: 'new@test.com',
          password: 'pass',
          role: 'EMPLOYEE',
        },
      ],
    });

    expect(result.isRight()).toBe(true);
    expect(usersRepository.items).toHaveLength(1);
    expect(usersRepository.items[0].email).toBe('new@test.com');
  });
});
