import { Controller, Get, HttpCode, Param } from '@nestjs/common';

import { FindPositionByIdUseCase } from '@/domain/stock/application/use-cases/position/find-position-by-id';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';
import { PositionPresenter } from '@/infra/presenter/position-presenter';

import {
  FindPositionByIdParams,
  paramsValidationPipe,
} from './schemas/find-position-by-id-schema';

@Controller('positions')
export class FindPositionByIdController {
  constructor(
    private readonly _findPositionByIdUseCase: FindPositionByIdUseCase,
  ) {}

  @Get(':id')
  @HttpCode(200)
  async handle(
    @Param(paramsValidationPipe) { id }: FindPositionByIdParams,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._findPositionByIdUseCase.execute({
      authenticateId: user.userId,
      positionId: id,
    });
    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
    return PositionPresenter.toHTTP(result.value.position);
  }
}
