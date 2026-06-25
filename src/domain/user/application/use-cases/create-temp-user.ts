import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { HashGenerator } from '../../../shared/application/cryptography/hash-generator';
import { TempUser } from '../../enterprise/entities/temp-user';
import { TempUsersRepository } from '../repositories/temp-users-repository';
import { UsersRepository } from '../repositories/users-repository';
import { AlreadyExistsEmailError } from './errors/already-exists-email-error';
import { UserNotAdminError } from './errors/user-not-admin-error';
import { UserNotFoundError } from './errors/user-not-found-error';

interface CreateTempUserUseCaseRequest {
  authenticateId: string;
  email: string;
  name: string;
  role: UserRole;
  password: string;
}

type CreateTempUserUseCaseResponse = Either<
  AlreadyExistsEmailError | UserNotFoundError | UserNotAdminError,
  { tempUser: TempUser }
>;

@Injectable()
export class CreateTempUserUseCase {
  constructor(
    private readonly _tempUsersRepository: TempUsersRepository,
    private readonly _usersRepository: UsersRepository,
    private readonly _hashGenerator: HashGenerator,
  ) {}

  async execute({
    authenticateId,
    email,
    name,
    role,
    password,
  }: CreateTempUserUseCaseRequest): Promise<CreateTempUserUseCaseResponse> {
    const authenticate = await this._usersRepository.findById(authenticateId);

    if (!authenticate) {
      return left(new UserNotFoundError());
    }

    if (authenticate.role !== UserRole.ADMIN) {
      return left(new UserNotAdminError());
    }

    const emailExists = await this._usersRepository.findByEmail(email);

    if (emailExists) {
      return left(new AlreadyExistsEmailError());
    }

    const alreadyExists = await this._tempUsersRepository.findByEmail(email);

    if (alreadyExists) {
      await this._tempUsersRepository.delete(alreadyExists.id.toString());
    }

    const passwordHash = await this._hashGenerator.hash(password);

    const tempUser = TempUser.create({
      companyId: authenticate.companyId,
      email,
      name,
      role,
      password: passwordHash,
    });

    await this._tempUsersRepository.create(tempUser);

    return right({ tempUser });
  }
}
