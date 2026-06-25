import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { CreateSubLocationUseCase } from '@/domain/stock/application/use-cases/sub-location/create-sub-location';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  bodyValidationPipe,
  CreateSubLocationBody,
} from './schemas/create-sub-location-schema';

@Controller('sub-locations')
export class CreateSubLocationController {
  constructor(
    private readonly _createSubLocationUseCase: CreateSubLocationUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(
    @Body(bodyValidationPipe) body: CreateSubLocationBody,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._createSubLocationUseCase.execute({
      authenticateId: user.userId,
      locationId: body.locationId,
      code: body.code,
      name: body.name,
      description: body.description,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
