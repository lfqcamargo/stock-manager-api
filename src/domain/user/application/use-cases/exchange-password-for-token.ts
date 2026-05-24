import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { HashGenerator } from '@/domain/shared/application/cryptography/hash-generator';

import { User } from '../../enterprise/entities/user';
import { TempPasswordTokensRepository } from '../repositories/temp-password-tokens-repository';
import { UsersRepository } from '../repositories/users-repository';
import { ResourceTokenNotFoundError } from './errors/resource-token-not-found-error';
import { TokenExpiratedError } from './errors/token-expirated-error';
import { UserNotFoundError } from './errors/user-not-found-error';

interface ExchangePasswordForTokenUseCaseRequest {
  token: string;
  password: string;
}

type ExchangePasswordForTokenUseCaseResult = Either<
  ResourceTokenNotFoundError | UserNotFoundError | TokenExpiratedError,
  {
    user: User;
  }
>;

@Injectable()
export class ExchangePasswordForTokenUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _tempPasswordTokensRepository: TempPasswordTokensRepository,
    private readonly _hashGenerator: HashGenerator,
  ) {}

  async execute({
    token,
    password,
  }: ExchangePasswordForTokenUseCaseRequest): Promise<ExchangePasswordForTokenUseCaseResult> {
    const passwordToken =
      await this._tempPasswordTokensRepository.findByToken(token);
    if (!passwordToken) {
      return left(new ResourceTokenNotFoundError());
    }
    const user = await this._usersRepository.findById(
      passwordToken.userId.toString(),
    );
    if (!user) return left(new UserNotFoundError());

    if (passwordToken.expirationDate < new Date()) {
      return left(new TokenExpiratedError());
    }

    const passwordHash = await this._hashGenerator.hash(password);

    user.updatePassword(passwordHash);

    await this._usersRepository.update(user);
    await this._tempPasswordTokensRepository.deleteByToken(passwordToken.token);

    return right({
      user: user,
    });
  }
}
