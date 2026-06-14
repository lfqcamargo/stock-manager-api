import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';

import { User } from '../../enterprise/entities/user';
import { UsersRepository } from '../repositories/users-repository';
import { UserNotFoundError } from './errors/user-not-found-error';

interface GetProfileUserUseCaseRequest {
  userAuthenticateId: string;
}
type GetProfileUserUseCaseResponse = Either<
  UserNotFoundError,
  {
    user: User;
  }
>;

@Injectable()
export class GetProfileUserUseCase {
  constructor(private readonly _usersRepository: UsersRepository) {}

  async execute({
    userAuthenticateId,
  }: GetProfileUserUseCaseRequest): Promise<GetProfileUserUseCaseResponse> {
    const user = await this._usersRepository.findById(userAuthenticateId);

    if (!user) {
      return left(new UserNotFoundError());
    }

    return right({
      user,
    });
  }
}
