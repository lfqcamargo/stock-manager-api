import { Controller, Get, HttpCode } from '@nestjs/common';

import { GetDashboardUseCase } from '@/domain/stock/application/use-cases/dashboard/get-dashboard';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

@Controller('dashboard')
export class GetDashboardController {
  constructor(private readonly _getDashboardUseCase: GetDashboardUseCase) {}

  @Get()
  @HttpCode(200)
  async handle(@CurrentUser() user: UserPayload) {
    const result = await this._getDashboardUseCase.execute({
      authenticatedId: user.userId,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);

    return result.value;
  }
}
