import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { CreateLocationUseCase } from '@/domain/stock/application/use-cases/location/create-location';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  bodyValidationPipe,
  CreateLocationBody,
} from './schemas/create-location-schema';

@Controller('locations')
export class CreateLocationController {
  constructor(private readonly _createLocationUseCase: CreateLocationUseCase) {}

  @Post()
  @HttpCode(201)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(
    @Body(bodyValidationPipe) body: CreateLocationBody,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._createLocationUseCase.execute({
      authenticateId: user.userId,
      code: body.code,
      name: body.name,
      description: body.description,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
