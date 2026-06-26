import { Controller, Get, HttpCode, Param } from '@nestjs/common';

import { FindShelfByIdUseCase } from '@/domain/stock/application/use-cases/shelf/find-shelf-by-id';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';
import { ShelfPresenter } from '@/infra/presenter/shelf-presenter';

import {
  FindShelfByIdParams,
  paramsValidationPipe,
} from './schemas/find-shelf-by-id-schema';

@Controller('shelfs')
export class FindShelfByIdController {
  constructor(private readonly _findShelfByIdUseCase: FindShelfByIdUseCase) {}

  @Get(':id')
  @HttpCode(200)
  async handle(
    @Param(paramsValidationPipe) { id }: FindShelfByIdParams,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._findShelfByIdUseCase.execute({
      authenticateId: user.userId,
      shelfId: id,
    });
    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
    return ShelfPresenter.toHTTP(result.value.shelf);
  }
}
