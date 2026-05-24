import { FakeAppConfig } from 'test/config/fake-app-config';
import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { FakeRefreshTokenVerifier } from 'test/cryptography/fake-refresh-token-verifier';
import { makeUser } from 'test/factories/make-user';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';

import { User } from '../../enterprise/entities/user';
import { InvalidRefreshTokenError } from './errors/invalid-refresh-token-error';
import { RefreshTokenUseCase } from './refresh-token';

let usersRepository: InMemoryUsersRepository;
let fakeEncrypter: FakeEncrypter;
let fakeAppConfig: FakeAppConfig;
let fakeVerifier: FakeRefreshTokenVerifier;
let sut: RefreshTokenUseCase;
let user: User;

describe('Refresh token use case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    user = makeUser();
    fakeAppConfig = new FakeAppConfig();
    fakeEncrypter = new FakeEncrypter();
    fakeVerifier = new FakeRefreshTokenVerifier(
      new Map([['valid-refresh', user.id.toString()]]),
    );

    sut = new RefreshTokenUseCase(
      usersRepository,
      fakeEncrypter,
      fakeVerifier,
      fakeAppConfig,
    );
  });

  it('should issue new tokens when refresh is valid', async () => {
    await usersRepository.create(user);

    const result = await sut.execute({ refreshToken: 'valid-refresh' });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const access = JSON.parse(result.value.accessToken);
      const refresh = JSON.parse(result.value.refreshToken);
      expect(access.userId).toBe(user.id.toString());
      expect(access._expiresIn).toBe('15m');
      expect(refresh.userId).toBe(user.id.toString());
      expect(refresh.typ).toBe('refresh');
      expect(refresh._expiresIn).toBe('7d');
    }
  });

  it('should reject invalid refresh token', async () => {
    const result = await sut.execute({ refreshToken: 'unknown' });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidRefreshTokenError);
  });

  it('should reject when user no longer exists', async () => {
    const result = await sut.execute({ refreshToken: 'valid-refresh' });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidRefreshTokenError);
  });
});
