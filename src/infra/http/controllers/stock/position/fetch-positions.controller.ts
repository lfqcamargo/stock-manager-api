import { Controller, Get, HttpCode, Query } from '@nestjs/common';

import { FetchPositionsUseCase } from '@/domain/stock/application/use-cases/position/fetch-positions';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';
import { PositionPresenter } from '@/infra/presenter/position-presenter';

import {
  FetchPositionsQuery,
  queryValidationPipe,
} from './schemas/fetch-positions-schema';

@Controller('positions')
export class FetchPositionsController {
  constructor(private readonly _fetchPositionsUseCase: FetchPositionsUseCase) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Query(queryValidationPipe) query: FetchPositionsQuery,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._fetchPositionsUseCase.execute({
      authenticatedId: user.userId,
      code: query.code,
      name: query.name,
      description: query.description,
      orderBy:
        query.orderBy && query.orderDirection
          ? { field: query.orderBy, direction: query.orderDirection }
          : undefined,
      page: query.page,
      itemsPerPage: query.itemsPerPage,
    });
    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
    const { positions, meta } = result.value;
    return {
      positions: positions?.map((item) => PositionPresenter.toHTTP(item)),
      meta,
    };
  }
}
