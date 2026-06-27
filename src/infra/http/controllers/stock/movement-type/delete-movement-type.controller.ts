import { Controller, Delete, HttpCode, Param } from '@nestjs/common';

import { DeleteMovementTypeUseCase } from '@/domain/stock/application/use-cases/movement-type/delete-movement-type';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  DeleteMovementTypeParams,
  paramsValidationPipe,
} from './schemas/delete-movement-type-schema';

@Controller('movement-types')
export class DeleteMovementTypeController {
  constructor(
    private readonly _deleteMovementTypeUseCase: DeleteMovementTypeUseCase,
  ) {}

  @Delete(':id')
  @HttpCode(204)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(
    @Param(paramsValidationPipe) { id }: DeleteMovementTypeParams,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._deleteMovementTypeUseCase.execute({
      authenticateId: user.userId,
      movementTypeId: id,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
