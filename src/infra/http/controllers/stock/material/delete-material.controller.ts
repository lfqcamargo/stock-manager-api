import { Controller, Delete, HttpCode, Param } from '@nestjs/common';

import { DeleteMaterialUseCase } from '@/domain/stock/application/use-cases/material/delete-material';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  DeleteMaterialParams,
  paramsValidationPipe,
} from './schemas/delete-material-schema';

@Controller('materials')
export class DeleteMaterialController {
  constructor(private readonly _deleteMaterialUseCase: DeleteMaterialUseCase) {}

  @Delete(':id')
  @HttpCode(204)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(
    @Param(paramsValidationPipe) { id }: DeleteMaterialParams,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._deleteMaterialUseCase.execute({
      authenticateId: user.userId,
      materialId: id,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
