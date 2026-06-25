import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';

import { UserRole } from '../../enterprise/entities/user';
import { UsersRepository } from '../repositories/users-repository';
import { NotAllowedError } from './errors/not-allowed-error';
import { UserNotAdminError } from './errors/user-not-admin-error';
import { UserNotBelongToCompanyError } from './errors/user-not-belong-to-company-error';
import { UserNotFoundError } from './errors/user-not-found-error';

interface DeleteUserUseCaseRequest {
  userId: string;
  authenticatedUserId: string;
}

type DeleteUserUseCaseResponse = Either<
  | UserNotFoundError
  | UserNotAdminError
  | UserNotBelongToCompanyError
  | NotAllowedError,
  null
>;

@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly _usersRepository: UsersRepository) {}

  async execute({
    userId,
    authenticatedUserId,
  }: DeleteUserUseCaseRequest): Promise<DeleteUserUseCaseResponse> {
    if (userId === authenticatedUserId) {
      return left(new NotAllowedError());
    }

    const targetUser = await this._usersRepository.findById(userId);

    if (!targetUser) {
      return left(new UserNotFoundError());
    }

    const authenticatedUser =
      await this._usersRepository.findById(authenticatedUserId);
    if (!authenticatedUser) {
      return left(new UserNotFoundError());
    }

    if (authenticatedUser.role !== UserRole.ADMIN) {
      return left(new UserNotAdminError());
    }

    if (
      authenticatedUser.companyId.toString() !== targetUser.companyId.toString()
    ) {
      return left(new UserNotBelongToCompanyError());
    }

    await this._usersRepository.delete(userId);
    return right(null);
  }
}
