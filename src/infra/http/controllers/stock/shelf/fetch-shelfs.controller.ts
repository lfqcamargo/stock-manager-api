import { Controller, Get, HttpCode, Query } from '@nestjs/common';

import { FetchShelfsUseCase } from '@/domain/stock/application/use-cases/shelf/fetch-shelfs';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';
import { ShelfPresenter } from '@/infra/presenter/shelf-presenter';

import { FetchShelfsQuery, queryValidationPipe } from './schemas/fetch-shelfs-schema';

@Controller('shelfs')
export class FetchShelfsController {
  constructor(private readonly _fetchShelfsUseCase: FetchShelfsUseCase) {}

  @Get()
  @HttpCode(200)
  async handle(@Query(queryValidationPipe) query: FetchShelfsQuery, @CurrentUser() user: UserPayload) {
    const result = await this._fetchShelfsUseCase.execute({
      authenticatedId: user.userId,
      code: query.code,
      name: query.name,
      description: query.description,
      orderBy: query.orderBy && query.orderDirection ? { field: query.orderBy, direction: query.orderDirection } : undefined,
      page: query.page,
      itemsPerPage: query.itemsPerPage,
    });
    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
    const { shelfs, meta } = result.value;
    return { shelfs: shelfs?.map((item) => ShelfPresenter.toHTTP(item)), meta };
  }
}
