import { Body, Controller, HttpCode, Param, Put } from '@nestjs/common';

import { EditMovementTypeUseCase } from '@/domain/stock/application/use-cases/movement-type/edit-movement-type';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  bodyValidationPipe,
  EditMovementTypeBody,
  EditMovementTypeParams,
  paramsValidationPipe,
} from './schemas/edit-movement-type-schema';

@Controller('movement-types')
export class EditMovementTypeController {
  constructor(
    private readonly _editMovementTypeUseCase: EditMovementTypeUseCase,
  ) {}

  @Put(':id')
  @HttpCode(200)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(
    @Param(paramsValidationPipe) { id }: EditMovementTypeParams,
    @Body(bodyValidationPipe) body: EditMovementTypeBody,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._editMovementTypeUseCase.execute({
      authenticateId: user.userId,
      movementTypeId: id,
      name: body.name,
      direction: body.direction,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
