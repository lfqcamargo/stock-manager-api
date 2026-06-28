import { Controller, Get, HttpCode, Query } from '@nestjs/common';

import { FetchMovementsUseCase } from '@/domain/stock/application/use-cases/movement/fetch-movements';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';
import { MovementPresenter } from '@/infra/presenter/movement-presenter';

import {
  FetchMovementsQuery,
  queryValidationPipe,
} from './schemas/fetch-movements-schema';

@Controller('movements')
export class FetchMovementsController {
  constructor(private readonly _fetchMovementsUseCase: FetchMovementsUseCase) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Query(queryValidationPipe) query: FetchMovementsQuery,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._fetchMovementsUseCase.execute({
      authenticatedId: user.userId,
      addressingId: query.addressingId,
      movementTypeId: query.movementTypeId,
      userId: query.userId,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      minQuantity: query.minQuantity,
      maxQuantity: query.maxQuantity,
      orderBy:
        query.orderBy && query.orderDirection
          ? { field: query.orderBy, direction: query.orderDirection }
          : undefined,
      page: query.page,
      itemsPerPage: query.itemsPerPage,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);

    const { movements, meta } = result.value;

    return {
      movements: movements.map((m) => MovementPresenter.toHTTP(m)),
      meta,
    };
  }
}
