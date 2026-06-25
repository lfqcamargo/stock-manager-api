import { Controller, Get, HttpCode, Query } from '@nestjs/common';

import { FetchAddressingsUseCase } from '@/domain/stock/application/use-cases/addressing/fetch-addressings';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';
import { AddressingPresenter } from '@/infra/presenter/addressing-presenter';

import {
  FetchAddressingsQuery,
  queryValidationPipe,
} from './schemas/fetch-addressings-schema';

@Controller('addressings')
export class FetchAddressingsController {
  constructor(
    private readonly _fetchAddressingsUseCase: FetchAddressingsUseCase,
  ) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Query(queryValidationPipe) query: FetchAddressingsQuery,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._fetchAddressingsUseCase.execute({
      authenticatedId: user.userId,
      locationId: query.locationId,
      subLocationId: query.subLocationId,
      rowId: query.rowId,
      shelfId: query.shelfId,
      positionId: query.positionId,
      materialId: query.materialId,
      active: query.active,
      minAmount: query.minAmount,
      maxAmount: query.maxAmount,
      orderBy:
        query.orderBy && query.orderDirection
          ? { field: query.orderBy, direction: query.orderDirection }
          : undefined,
      page: query.page,
      itemsPerPage: query.itemsPerPage,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);

    const { addressings, meta } = result.value;

    return {
      addressings: addressings?.map((addressing) =>
        AddressingPresenter.toHTTPDetails(addressing),
      ),
      meta,
    };
  }
}
