import { Controller, Get, HttpCode, Query } from '@nestjs/common';

import { FetchGroupsUseCase } from '@/domain/stock/application/use-cases/group/fetch-groups';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';
import { GroupPresenter } from '@/infra/presenter/group-presenter';

import {
  FetchGroupsQuery,
  queryValidationPipe,
} from './schemas/fetch-groups-schema';

@Controller('groups')
export class FetchGroupsController {
  constructor(private readonly _fetchGroupsUseCase: FetchGroupsUseCase) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Query(queryValidationPipe) query: FetchGroupsQuery,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._fetchGroupsUseCase.execute({
      authenticatedId: user.userId,
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

    const { groups, meta } = result.value;

    return {
      groups: groups?.map((group) => GroupPresenter.toHTTP(group)),
      meta,
    };
  }
}
