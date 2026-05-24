import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { AppConfig } from '@/domain/shared/application/config/app-config';
import { Encrypter } from '@/domain/shared/application/cryptography/encrypter';
import { RefreshTokenVerifier } from '@/domain/shared/application/cryptography/refresh-token-verifier';

import { User } from '../../enterprise/entities/user';
import { UsersRepository } from '../repositories/users-repository';
import { InvalidRefreshTokenError } from './errors/invalid-refresh-token-error';

interface RefreshTokenUseCaseRequest {
  refreshToken: string;
}

type RefreshTokenUseCaseResponse = Either<
  InvalidRefreshTokenError,
  { accessToken: string; refreshToken: string }
>;

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _encrypter: Encrypter,
    private readonly _refreshTokenVerifier: RefreshTokenVerifier,
    private readonly _appConfig: AppConfig,
  ) {}

  async execute({
    refreshToken,
  }: RefreshTokenUseCaseRequest): Promise<RefreshTokenUseCaseResponse> {
    const decoded = await this._refreshTokenVerifier.verify(refreshToken);

    if (!decoded) {
      return left(new InvalidRefreshTokenError());
    }

    const user = await this._usersRepository.findById(decoded.userId);

    if (!user) {
      return left(new InvalidRefreshTokenError());
    }

    user.updateLastLogin();
    return right(await this._issueTokensForUser(user));
  }

  private async _issueTokensForUser(user: User) {
    let accessExpiresIn: string;
    let refreshExpiresIn: string;

    if (user.email) {
      accessExpiresIn = this._appConfig.accessExpiresIn;
      refreshExpiresIn = this._appConfig.refreshExpiresIn;
    } else {
      accessExpiresIn = '99y';
      refreshExpiresIn = '99y';
    }

    const accessToken = await this._encrypter.encrypt(
      { userId: user.id.toString() },
      { expiresIn: accessExpiresIn },
    );

    const refreshToken = await this._encrypter.encrypt(
      { userId: user.id.toString(), typ: 'refresh' },
      { expiresIn: refreshExpiresIn },
    );

    return { accessToken, refreshToken };
  }
}
