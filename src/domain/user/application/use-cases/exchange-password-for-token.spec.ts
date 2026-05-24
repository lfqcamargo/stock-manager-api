import { FakeHasher } from 'test/cryptography/fake-hasher';
import { makeTempPasswordToken } from 'test/factories/make-temp-password-token';
import { makeUser } from 'test/factories/make-user';
import { InMemoryTempPasswordTokensRepository } from 'test/repositories/in-memory-temp-password-tokens-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';

import { ResourceTokenNotFoundError } from './errors/resource-token-not-found-error';
import { TokenExpiratedError } from './errors/token-expirated-error';
import { ExchangePasswordForTokenUseCase } from './exchange-password-for-token';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryTempPasswordTokensRepository: InMemoryTempPasswordTokensRepository;
let hashGenerator: FakeHasher;
let exchangePasswordForToken: ExchangePasswordForTokenUseCase;

describe('Exchange password for token use case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryTempPasswordTokensRepository =
      new InMemoryTempPasswordTokensRepository();
    hashGenerator = new FakeHasher();

    exchangePasswordForToken = new ExchangePasswordForTokenUseCase(
      inMemoryUsersRepository,
      inMemoryTempPasswordTokensRepository,
      hashGenerator,
    );
  });

  it('should be able to exchange password for token', async () => {
    const user = makeUser({ email: 'test@test.com' });
    await inMemoryUsersRepository.create(user);

    const passwordToken = makeTempPasswordToken({
      userId: user.id,
      expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });

    await inMemoryTempPasswordTokensRepository.create(passwordToken);

    const result = await exchangePasswordForToken.execute({
      token: passwordToken.token,
      password: 'test',
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryUsersRepository.items[0].password).toEqual('test-hashed');
    expect(inMemoryTempPasswordTokensRepository.items).toHaveLength(0);
  });

  it('should not be able to exchange password for token with an expired token', async () => {
    const user = makeUser({
      email: 'test@test.com',
      password: 'test-hashed',
    });
    await inMemoryUsersRepository.create(user);

    const passwordToken = makeTempPasswordToken({
      userId: user.id,
      token: 'token-test',
      expirationDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
    });

    await inMemoryTempPasswordTokensRepository.create(passwordToken);

    const result = await exchangePasswordForToken.execute({
      token: passwordToken.token,
      password: 'new-password',
    });

    expect(result.isLeft()).toBe(true);
    expect(inMemoryUsersRepository.items[0].password).toEqual('test-hashed');
    expect(inMemoryTempPasswordTokensRepository.items).toHaveLength(1);
    expect(result.value).toBeInstanceOf(TokenExpiratedError);
  });

  it('should not be able to exchange password for token with an invalid token', async () => {
    const result = await exchangePasswordForToken.execute({
      token: 'invalid-token',
      password: 'test',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceTokenNotFoundError);
  });
});
