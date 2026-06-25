import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';

import { User } from '../../enterprise/entities/user';
import { TempUsersRepository } from '../repositories/temp-users-repository';
import { UsersRepository } from '../repositories/users-repository';
import { AlreadyExistsEmailError } from './errors/already-exists-email-error';
import { ResourceTokenNotFoundError } from './errors/resource-token-not-found-error';
import { TokenExpiratedError } from './errors/token-expirated-error';

interface ConfirmationCreateUserUseCaseRequest {
  token: string;
}

type ConfirmationCreateUserUseCaseResponse = Either<
  ResourceTokenNotFoundError | AlreadyExistsEmailError | TokenExpiratedError,
  {
    user: User;
  }
>;

@Injectable()
export class ConfirmationCreateUserUseCase {
  constructor(
    private readonly _tempUsersRepository: TempUsersRepository,
    private readonly _usersRepository: UsersRepository,
  ) {}

  async execute({
    token,
  }: ConfirmationCreateUserUseCaseRequest): Promise<ConfirmationCreateUserUseCaseResponse> {
    const tempUser = await this._tempUsersRepository.findByToken(token);

    if (!tempUser) {
      return left(new ResourceTokenNotFoundError());
    }

    const alreadyExistsEmail = await this._usersRepository.findByEmail(
      tempUser.email,
    );

    if (alreadyExistsEmail) {
      return left(new AlreadyExistsEmailError());
    }

    if (tempUser.expirationDate < new Date()) {
      return left(new TokenExpiratedError());
    }

    const user = User.create({
      email: tempUser.email,
      name: tempUser.name,
      password: tempUser.password,
      role: tempUser.role,
      companyId: tempUser.companyId,
      active: true,
    });

    await this._tempUsersRepository.delete(tempUser.id.toString());
    await this._usersRepository.create(user);

    return right({ user });
  }
}
