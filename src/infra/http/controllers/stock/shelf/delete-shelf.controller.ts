import { Controller, Delete, HttpCode, Param } from '@nestjs/common';

import { DeleteShelfUseCase } from '@/domain/stock/application/use-cases/shelf/delete-shelf';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import { DeleteShelfParams, paramsValidationPipe } from './schemas/delete-shelf-schema';

@Controller('shelfs')
export class DeleteShelfController {
  constructor(private readonly _deleteShelfUseCase: DeleteShelfUseCase) {}

  @Delete(':id')
  @HttpCode(204)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(@Param(paramsValidationPipe) { id }: DeleteShelfParams, @CurrentUser() user: UserPayload) {
    const result = await this._deleteShelfUseCase.execute({ authenticateId: user.userId, shelfId: id });
    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
