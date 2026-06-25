import { Controller, Delete, HttpCode, Param } from '@nestjs/common';

import { DeleteSubLocationUseCase } from '@/domain/stock/application/use-cases/sub-location/delete-sub-location';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  DeleteSubLocationParams,
  paramsValidationPipe,
} from './schemas/delete-sub-location-schema';

@Controller('sub-locations')
export class DeleteSubLocationController {
  constructor(
    private readonly _deleteSubLocationUseCase: DeleteSubLocationUseCase,
  ) {}

  @Delete(':id')
  @HttpCode(204)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(
    @Param(paramsValidationPipe) { id }: DeleteSubLocationParams,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._deleteSubLocationUseCase.execute({
      authenticateId: user.userId,
      subLocationId: id,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
