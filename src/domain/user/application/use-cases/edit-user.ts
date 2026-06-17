import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { User, UserRole } from '@/domain/user/enterprise/entities/user';

import { UsersRepository } from '../repositories/users-repository';
import { CompanyNotFoundError } from './errors/company-not-found-error';
import { UserNotAdminError } from './errors/user-not-admin-error';
import { UserNotFoundError } from './errors/user-not-found-error';

interface EditUserUseCaseRequest {
  userId: string;
  authenticateUserId: string;
  name: string;
  photo: string | null;
  role?: UserRole;
  active?: boolean;
}

type EditUserUseCaseResponse = Either<
  UserNotFoundError | CompanyNotFoundError | UserNotAdminError,
  {
    user: User;
  }
>;

@Injectable()
export class EditUserUseCase {
  constructor(private readonly _usersRepository: UsersRepository) {}

  async execute({
    userId,
    authenticateUserId,
    name,
    photo,
    role,
    active,
  }: EditUserUseCaseRequest): Promise<EditUserUseCaseResponse> {
    const authUser = await this._usersRepository.findById(authenticateUserId);
    if (!authUser) return left(new UserNotFoundError());

    const user = await this._usersRepository.findById(userId);
    if (!user) return left(new UserNotFoundError());

    if (user.companyId.toString() !== authUser.companyId.toString())
      return left(new CompanyNotFoundError());

    if (authUser.role !== UserRole.ADMIN) {
      if (userId !== authenticateUserId) return left(new UserNotAdminError());
    }

    user.updateName(name);
    if (photo !== undefined) {
      user.updatePhoto(photo);
    }

    if (authUser.role === UserRole.ADMIN) {
      if (role !== undefined) {
        user.changeRole(role);
      }
      if (active !== undefined) {
        if (active) {
          user.activate();
        } else {
          user.deactivate();
        }
      }
    }

    await this._usersRepository.update(user);

    return right({ user });
  }
}
