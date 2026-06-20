import { Controller, Get, HttpCode, Query } from '@nestjs/common';

import { FetchUsersCompanyIdUseCase } from '@/domain/user/application/use-cases/fetch-users';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { UserPresenter } from '@/infra/presenter/user-presenter';

import { mapUseCaseErrorToHttpException } from '../../errors/map-use-case-error';
import {
  FetchUsersQuery,
  queryValidationPipe,
} from './schemas/fetch-users-schema';

@Controller('users')
export class FetchUsersController {
  constructor(
    private readonly _fetchUsersCompanyIdUseCase: FetchUsersCompanyIdUseCase,
  ) {}

  @Get()
  @HttpCode(200)
  @Roles(UserRole.ADMIN)
  async handle(
    @CurrentUser() user: UserPayload,
    @Query(queryValidationPipe) query: FetchUsersQuery,
  ) {
    const { userId } = user;

    const result = await this._fetchUsersCompanyIdUseCase.execute({
      authenticatedUserId: userId,
      page: query.page,
      itemsPerPage: query.itemsPerPage,
      email: query.email,
      name: query.name,
      role: query.role,
      active: query.active,
      createdAtStart: query.createdAtStart,
      createdAtEnd: query.createdAtEnd,
      orderBy:
        query.orderBy && query.orderDirection
          ? { field: query.orderBy, direction: query.orderDirection }
          : undefined,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);

    const { users, meta } = result.value;

    return {
      users: users?.map((user) => UserPresenter.toHTTP(user)),
      meta: meta,
    };
  }
}
