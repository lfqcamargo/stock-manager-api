import { Controller, Get, HttpCode, NotFoundException } from '@nestjs/common';

import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { GetProfileUserUseCase } from '@/domain/user/application/use-cases/get-profile-user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';

@Controller('/users/me')
export class GetProfileUserController {
  constructor(private readonly _getProfileUserUseCase: GetProfileUserUseCase) {}

  @Get()
  @HttpCode(200)
  async handle(@CurrentUser() user: UserPayload) {
    const result = await this._getProfileUserUseCase.execute({
      userAuthenticateId: user.userId,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new NotFoundException(error.message);
      }
    }

    const { user: userDomain } = result.value;

    return {
      user: {
        id: userDomain.id.toString(),
        name: userDomain.name,
        email: userDomain.email,
        role: userDomain.role,
        active: userDomain.isActive,
        photo: userDomain.photo,
        companyId: userDomain.companyId.toString(),
        createdAt: userDomain.createdAt,
        updatedAt: userDomain.updatedAt,
        lastLogin: userDomain.lastLogin,
      },
    };
  }
}
