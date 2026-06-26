import { makeShelf } from 'test/factories/make-shelf';
import { makeUser } from 'test/factories/make-user';
import { InMemoryShelfsRepository } from 'test/repositories/in-memory-shelfs-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { EditShelfUseCase } from './edit-shelf';
import { AlreadyExistsShelfError } from './errors/already-exists-shelf-error';
import { ShelfNotFoundError } from './errors/shelf-not-found-error';

let usersRepository: InMemoryUsersRepository;
let shelfsRepository: InMemoryShelfsRepository;
let editShelfUseCase: EditShelfUseCase;

describe('EditShelfUseCase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    shelfsRepository = new InMemoryShelfsRepository();

    editShelfUseCase = new EditShelfUseCase(usersRepository, shelfsRepository);
  });

  it('should edit a shelf successfully', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const shelf = makeShelf({
      companyId: user.companyId,
      code: 'OLD-001',
      name: 'Old Name',
    });
    await shelfsRepository.create(shelf);

    const result = await editShelfUseCase.execute({
      authenticateId: user.id.toString(),
      shelfId: shelf.id.toString(),
      code: 'NEW-001',
      name: 'New Name',
      description: 'New Description',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.shelf.name).toBe('New Name');
      expect(result.value.shelf.code).toBe('NEW-001');
      expect(result.value.shelf.description).toBe('New Description');
    }
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await editShelfUseCase.execute({
      authenticateId: 'non-existent-user',
      shelfId: 'any-shelf',
      code: 'NEW-001',
      name: 'New Name',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return UserNotAllowedError if user is not admin or manager', async () => {
    const user = makeUser({ role: UserRole.EMPLOYEE });
    await usersRepository.create(user);

    const result = await editShelfUseCase.execute({
      authenticateId: user.id.toString(),
      shelfId: 'any-shelf',
      code: 'NEW-001',
      name: 'New Name',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return ShelfNotFoundError if shelf does not exist', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await editShelfUseCase.execute({
      authenticateId: user.id.toString(),
      shelfId: 'non-existent-shelf',
      code: 'NEW-001',
      name: 'New Name',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ShelfNotFoundError);
  });

  it('should return AlreadyExistsShelfError if name already exists', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const shelf1 = makeShelf({
      companyId: user.companyId,
      code: 'SHELF-001',
      name: 'Shelf 1',
    });
    const shelf2 = makeShelf({
      companyId: user.companyId,
      code: 'SHELF-002',
      name: 'Shelf 2',
    });

    await shelfsRepository.create(shelf1);
    await shelfsRepository.create(shelf2);

    const result = await editShelfUseCase.execute({
      authenticateId: user.id.toString(),
      shelfId: shelf1.id.toString(),
      code: 'SHELF-001',
      name: 'Shelf 2',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsShelfError);
  });

  it('should return AlreadyExistsShelfError if code already exists', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const shelf1 = makeShelf({
      companyId: user.companyId,
      code: 'SHELF-001',
      name: 'Shelf 1',
    });
    const shelf2 = makeShelf({
      companyId: user.companyId,
      code: 'SHELF-002',
      name: 'Shelf 2',
    });

    await shelfsRepository.create(shelf1);
    await shelfsRepository.create(shelf2);

    const result = await editShelfUseCase.execute({
      authenticateId: user.id.toString(),
      shelfId: shelf1.id.toString(),
      code: 'SHELF-002',
      name: 'Shelf 1',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsShelfError);
  });
});
