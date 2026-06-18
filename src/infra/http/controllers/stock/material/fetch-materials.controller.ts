import { Controller, Get, HttpCode, Query } from '@nestjs/common';

import { FetchMaterialsUseCase } from '@/domain/stock/application/use-cases/material/fetch-materials';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';
import { MaterialPresenter } from '@/infra/presenter/material-presenter';

import {
  FetchMaterialsQuery,
  queryValidationPipe,
} from './schemas/fetch-materials-schema';

@Controller('materials')
export class FetchMaterialsController {
  constructor(private readonly _fetchMaterialsUseCase: FetchMaterialsUseCase) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Query(queryValidationPipe) query: FetchMaterialsQuery,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._fetchMaterialsUseCase.execute({
      authenticatedId: user.userId,
      groupId: query.groupId,
      code: query.code,
      name: query.name,
      description: query.description,
      active: query.active,
      orderBy:
        query.orderBy && query.orderDirection
          ? { field: query.orderBy, direction: query.orderDirection }
          : undefined,
      page: query.page,
      itemsPerPage: query.itemsPerPage,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);

    const { materials, meta } = result.value;

    return {
      materials: materials?.map((material) =>
        MaterialPresenter.toHTTPDetails(material),
      ),
      meta,
    };
  }
}
