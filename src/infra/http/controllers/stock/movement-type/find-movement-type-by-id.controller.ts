import { Controller, Get, HttpCode, Param } from '@nestjs/common';

import { FindMovementTypeByIdUseCase } from '@/domain/stock/application/use-cases/movement-type/find-movement-type-by-id';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';
import { MovementTypePresenter } from '@/infra/presenter/movement-type-presenter';

import {
  FindMovementTypeByIdParams,
  paramsValidationPipe,
} from './schemas/find-movement-type-by-id-schema';

@Controller('movement-types')
export class FindMovementTypeByIdController {
  constructor(
    private readonly _findMovementTypeByIdUseCase: FindMovementTypeByIdUseCase,
  ) {}

  @Get(':id')
  @HttpCode(200)
  async handle(
    @Param(paramsValidationPipe) { id }: FindMovementTypeByIdParams,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._findMovementTypeByIdUseCase.execute({
      authenticateId: user.userId,
      movementTypeId: id,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);

    return MovementTypePresenter.toHTTP(result.value.movementType);
  }
}
