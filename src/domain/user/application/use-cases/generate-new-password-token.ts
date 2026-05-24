import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';

import { TempPasswordToken } from '../../enterprise/entities/temp-password-token';
import { TempPasswordTokensRepository } from '../repositories/temp-password-tokens-repository';
import { UsersRepository } from '../repositories/users-repository';
import { UserNotFoundError } from './errors/user-not-found-error';

interface GenerateNewPasswordTokenUseCaseRequest {
  email: string;
}

type GenerateNewPasswordTokenUseCaseResult = Either<
  UserNotFoundError,
  { tempPasswordToken: TempPasswordToken }
>;

@Injectable()
export class GenerateNewPasswordTokenUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _tempPasswordTokensRepository: TempPasswordTokensRepository,
  ) {}

  async execute({
    email,
  }: GenerateNewPasswordTokenUseCaseRequest): Promise<GenerateNewPasswordTokenUseCaseResult> {
    const user = await this._usersRepository.findByEmail(email);

    if (!user) {
      return left(new UserNotFoundError());
    }

    const tempPasswordToken = TempPasswordToken.create({
      userId: user.id,
      companyId: user.companyId,
    });

    await this._tempPasswordTokensRepository.deleteByUserId(user.id.toString());
    await this._tempPasswordTokensRepository.create(tempPasswordToken);

    return right({
      tempPasswordToken,
    });
  }
}
