import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { CreateMovementTypeUseCase } from '@/domain/stock/application/use-cases/movement-type/create-movement-type';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  bodyValidationPipe,
  CreateMovementTypeBody,
} from './schemas/create-movement-type-schema';

@Controller('movement-types')
export class CreateMovementTypeController {
  constructor(
    private readonly _createMovementTypeUseCase: CreateMovementTypeUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(
    @Body(bodyValidationPipe) body: CreateMovementTypeBody,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._createMovementTypeUseCase.execute({
      authenticateId: user.userId,
      name: body.name,
      direction: body.direction,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
