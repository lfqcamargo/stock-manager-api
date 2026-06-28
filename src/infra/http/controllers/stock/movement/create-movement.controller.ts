import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { CreateMovementUseCase } from '@/domain/stock/application/use-cases/movement/create-movement';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';
import { MovementPresenter } from '@/infra/presenter/movement-presenter';

import {
  bodyValidationPipe,
  CreateMovementBody,
} from './schemas/create-movement-schema';

@Controller('movements')
export class CreateMovementController {
  constructor(private readonly _createMovementUseCase: CreateMovementUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: CreateMovementBody,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._createMovementUseCase.execute({
      authenticateId: user.userId,
      addressingId: body.addressingId,
      movementTypeId: body.movementTypeId,
      quantity: body.quantity,
      date: body.date,
      observation: body.observation,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);

    return MovementPresenter.toHTTP(result.value.movement);
  }
}
