import { makeUser } from 'test/factories/make-user';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';

import { UserRole } from '../../enterprise/entities/user';
import { EditUserUseCase } from './edit-user';
import { CompanyNotFoundError } from './errors/company-not-found-error';
import { UserNotAdminError } from './errors/user-not-admin-error';
import { UserNotFoundError } from './errors/user-not-found-error';

let inMemoryUsersRepository: InMemoryUsersRepository;
let sut: EditUserUseCase;

describe('Edit User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    sut = new EditUserUseCase(inMemoryUsersRepository);
  });

  it('should allow user to edit their own name and photo', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const result = await sut.execute({
      userId: user.id.toString(),
      authenticateUserId: user.id.toString(),
      name: 'Updated Name',
      photo: 'new-photo-id',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.user.name).toBe('Updated Name');
      expect(result.value.user.photo).toBe('new-photo-id');
    }
  });

  it('should allow admin to edit another user including role and active', async () => {
    const sameCompanyId = new UniqueEntityID();
    const admin = makeUser({ role: UserRole.ADMIN, companyId: sameCompanyId });
    const targetUser = makeUser({
      role: UserRole.EMPLOYEE,
      active: true,
      companyId: sameCompanyId,
    });

    await inMemoryUsersRepository.create(admin);
    await inMemoryUsersRepository.create(targetUser);

    const result = await sut.execute({
      userId: targetUser.id.toString(),
      authenticateUserId: admin.id.toString(),
      name: 'Changed Name',
      photo: 'new-photo-id',
      role: UserRole.ADMIN,
      active: false,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.user.name).toBe('Changed Name');
      expect(result.value.user.role).toBe(UserRole.ADMIN);
      expect(result.value.user.isActive).toBe(false);
    }
  });

  it('should not allow non-admin user to edit another user', async () => {
    const sameCompanyId = new UniqueEntityID();
    const user1 = makeUser({
      role: UserRole.EMPLOYEE,
      companyId: sameCompanyId,
    });
    const user2 = makeUser({
      role: UserRole.EMPLOYEE,
      companyId: sameCompanyId,
    });

    await inMemoryUsersRepository.create(user1);
    await inMemoryUsersRepository.create(user2);

    const result = await sut.execute({
      userId: user2.id.toString(),
      authenticateUserId: user1.id.toString(),
      name: 'New Name',
      photo: null,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAdminError);
  });

  it('should return error if user to edit is not found', async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(admin);

    const result = await sut.execute({
      userId: 'non-existent-id',
      authenticateUserId: admin.id.toString(),
      name: 'Name',
      photo: null,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return error if authenticated user is not found', async () => {
    const targetUser = makeUser();
    await inMemoryUsersRepository.create(targetUser);

    const result = await sut.execute({
      userId: targetUser.id.toString(),
      authenticateUserId: 'non-existent-id',
      name: 'Name',
      photo: null,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should not allow user to edit another user from different company', async () => {
    const admin = makeUser({
      role: UserRole.ADMIN,
      companyId: new UniqueEntityID('company-1'),
    });
    const targetUser = makeUser({
      role: UserRole.EMPLOYEE,
      companyId: new UniqueEntityID('company-2'),
    });

    await inMemoryUsersRepository.create(admin);
    await inMemoryUsersRepository.create(targetUser);

    const result = await sut.execute({
      userId: targetUser.id.toString(),
      authenticateUserId: admin.id.toString(),
      name: 'Changed Name',
      photo: null,
      role: UserRole.ADMIN,
      active: false,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(CompanyNotFoundError);
  });
});
