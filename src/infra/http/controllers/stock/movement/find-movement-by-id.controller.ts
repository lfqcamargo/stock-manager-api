import { Controller, Get, HttpCode, Param } from '@nestjs/common';

import { FindMovementByIdUseCase } from '@/domain/stock/application/use-cases/movement/find-movement-by-id';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';
import { MovementPresenter } from '@/infra/presenter/movement-presenter';

import {
  FindMovementByIdParams,
  paramsValidationPipe,
} from './schemas/find-movement-by-id-schema';

@Controller('movements')
export class FindMovementByIdController {
  constructor(
    private readonly _findMovementByIdUseCase: FindMovementByIdUseCase,
  ) {}

  @Get(':id')
  @HttpCode(200)
  async handle(
    @Param(paramsValidationPipe) { id }: FindMovementByIdParams,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._findMovementByIdUseCase.execute({
      authenticateId: user.userId,
      movementId: id,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);

    return MovementPresenter.toHTTP(result.value.movement);
  }
}
