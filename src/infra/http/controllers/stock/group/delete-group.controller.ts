import { Controller, Delete, HttpCode, Param } from '@nestjs/common';

import { DeleteGroupUseCase } from '@/domain/stock/application/use-cases/group/delete-group';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  DeleteGroupParams,
  paramsValidationPipe,
} from './schemas/delete-group-schema';

@Controller('groups')
export class DeleteGroupController {
  constructor(private readonly _deleteGroupUseCase: DeleteGroupUseCase) {}

  @Delete(':id')
  @HttpCode(204)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(
    @Param(paramsValidationPipe) { id }: DeleteGroupParams,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._deleteGroupUseCase.execute({
      authenticateId: user.userId,
      groupId: id,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
