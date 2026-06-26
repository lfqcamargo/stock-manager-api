import { Controller, Get, HttpCode, Param } from '@nestjs/common';

import { FindRowByIdUseCase } from '@/domain/stock/application/use-cases/row/find-row-by-id';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';
import { RowPresenter } from '@/infra/presenter/row-presenter';

import {
  FindRowByIdParams,
  paramsValidationPipe,
} from './schemas/find-row-by-id-schema';

@Controller('rows')
export class FindRowByIdController {
  constructor(private readonly _findRowByIdUseCase: FindRowByIdUseCase) {}

  @Get(':id')
  @HttpCode(200)
  async handle(
    @Param(paramsValidationPipe) { id }: FindRowByIdParams,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._findRowByIdUseCase.execute({
      authenticateId: user.userId,
      rowId: id,
    });
    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
    return RowPresenter.toHTTP(result.value.row);
  }
}
