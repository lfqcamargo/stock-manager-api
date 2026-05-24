import { makeUser } from 'test/factories/make-user';
import { InMemoryTempPasswordTokensRepository } from 'test/repositories/in-memory-temp-password-tokens-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';

import { UserNotFoundError } from './errors/user-not-found-error';
import { GenerateNewPasswordTokenUseCase } from './generate-new-password-token';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryTempPasswordTokensRepository: InMemoryTempPasswordTokensRepository;
let sut: GenerateNewPasswordTokenUseCase;

describe('Generate new password token', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryTempPasswordTokensRepository =
      new InMemoryTempPasswordTokensRepository();

    sut = new GenerateNewPasswordTokenUseCase(
      inMemoryUsersRepository,
      inMemoryTempPasswordTokensRepository,
    );
  });

  it('should generate a new password token', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const result = await sut.execute({
      email: user.email,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.tempPasswordToken).toBeTruthy();
      expect(result.value.tempPasswordToken.expirationDate).toBeInstanceOf(
        Date,
      );
      expect(inMemoryTempPasswordTokensRepository.items).toHaveLength(1);
    }
  });

  it('should not generate a token for non-existing user', async () => {
    const result = await sut.execute({
      email: 'non-existing@example.com',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should delete previous tokens when generating a new one', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    await sut.execute({
      email: user.email,
    });

    const result = await sut.execute({
      email: user.email,
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryTempPasswordTokensRepository.items).toHaveLength(1);
  });
});
