import { Controller, Delete, HttpCode, Param } from '@nestjs/common';

import { DeletePositionUseCase } from '@/domain/stock/application/use-cases/position/delete-position';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  DeletePositionParams,
  paramsValidationPipe,
} from './schemas/delete-position-schema';

@Controller('positions')
export class DeletePositionController {
  constructor(private readonly _deletePositionUseCase: DeletePositionUseCase) {}

  @Delete(':id')
  @HttpCode(204)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(
    @Param(paramsValidationPipe) { id }: DeletePositionParams,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._deletePositionUseCase.execute({
      authenticateId: user.userId,
      positionId: id,
    });
    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
