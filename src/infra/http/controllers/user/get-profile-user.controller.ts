import { Controller, Get, HttpCode } from '@nestjs/common';

import { GetProfileUserUseCase } from '@/domain/user/application/use-cases/get-profile-user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';
import { UserPresenter } from '@/infra/presenter/user-presenter';

@Controller('/users/me')
export class GetProfileUserController {
  constructor(private readonly _getProfileUserUseCase: GetProfileUserUseCase) {}

  @Get()
  @HttpCode(200)
  async handle(@CurrentUser() user: UserPayload) {
    const result = await this._getProfileUserUseCase.execute({
      userAuthenticateId: user.userId,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);

    const { user: userDomain } = result.value;

    return {
      user: UserPresenter.toHTTP(userDomain),
    };
  }
}
