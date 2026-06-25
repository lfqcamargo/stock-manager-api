import { Controller, Get, HttpCode, Query } from '@nestjs/common';

import { FetchLocationsUseCase } from '@/domain/stock/application/use-cases/location/fetch-locations';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';
import { LocationPresenter } from '@/infra/presenter/location-presenter';

import {
  FetchLocationsQuery,
  queryValidationPipe,
} from './schemas/fetch-locations-schema';

@Controller('locations')
export class FetchLocationsController {
  constructor(
    private readonly _fetchLocationsUseCase: FetchLocationsUseCase,
  ) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Query(queryValidationPipe) query: FetchLocationsQuery,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._fetchLocationsUseCase.execute({
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

    const { locations, meta } = result.value;

    return {
      locations: locations?.map((location) =>
        LocationPresenter.toHTTP(location),
      ),
      meta,
    };
  }
}
