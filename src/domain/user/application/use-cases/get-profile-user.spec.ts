import { makeUser } from 'test/factories/make-user';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotFoundError } from './errors/user-not-found-error';
import { GetProfileUserUseCase } from './get-profile-user';

let usersRepository: InMemoryUsersRepository;
let sut: GetProfileUserUseCase;

describe('Get profile user', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    sut = new GetProfileUserUseCase(usersRepository);
  });

  it('should return user profile if user exists', async () => {
    const user = makeUser();
    await usersRepository.create(user);

    const result = await sut.execute({
      userAuthenticateId: user.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.user.id.toString()).toEqual(user.id.toString());
    }
  });

  it('should return error if user does not exist', async () => {
    const result = await sut.execute({
      userAuthenticateId: 'non-existent-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });
});
