import { Controller, Delete, HttpCode, Param } from '@nestjs/common';

import { DeleteRowUseCase } from '@/domain/stock/application/use-cases/row/delete-row';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  DeleteRowParams,
  paramsValidationPipe,
} from './schemas/delete-row-schema';

@Controller('rows')
export class DeleteRowController {
  constructor(private readonly _deleteRowUseCase: DeleteRowUseCase) {}

  @Delete(':id')
  @HttpCode(204)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(
    @Param(paramsValidationPipe) { id }: DeleteRowParams,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._deleteRowUseCase.execute({
      authenticateId: user.userId,
      rowId: id,
    });
    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
