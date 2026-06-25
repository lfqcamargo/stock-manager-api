import { Controller, Get, HttpCode, Query } from '@nestjs/common';

import { FetchSubLocationsUseCase } from '@/domain/stock/application/use-cases/sub-location/fetch-sub-locations';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';
import { SubLocationPresenter } from '@/infra/presenter/sub-location-presenter';

import {
  FetchSubLocationsQuery,
  queryValidationPipe,
} from './schemas/fetch-sub-locations-schema';

@Controller('sub-locations')
export class FetchSubLocationsController {
  constructor(
    private readonly _fetchSubLocationsUseCase: FetchSubLocationsUseCase,
  ) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Query(queryValidationPipe) query: FetchSubLocationsQuery,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._fetchSubLocationsUseCase.execute({
      authenticatedId: user.userId,
      locationId: query.locationId,
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

    const { subLocations, meta } = result.value;

    return {
      subLocations: subLocations?.map((subLocation) =>
        SubLocationPresenter.toHTTPDetails(subLocation),
      ),
      meta,
    };
  }
}
