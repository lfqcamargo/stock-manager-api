import { Controller, Get, HttpCode, Query } from '@nestjs/common';

import { FetchRowsUseCase } from '@/domain/stock/application/use-cases/row/fetch-rows';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';
import { RowPresenter } from '@/infra/presenter/row-presenter';

import {
  FetchRowsQuery,
  queryValidationPipe,
} from './schemas/fetch-rows-schema';

@Controller('rows')
export class FetchRowsController {
  constructor(private readonly _fetchRowsUseCase: FetchRowsUseCase) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Query(queryValidationPipe) query: FetchRowsQuery,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._fetchRowsUseCase.execute({
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
    const { rows, meta } = result.value;
    return { rows: rows?.map((item) => RowPresenter.toHTTP(item)), meta };
  }
}
