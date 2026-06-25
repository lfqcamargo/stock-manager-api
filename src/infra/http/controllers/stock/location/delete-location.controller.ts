import { Controller, Delete, HttpCode, Param } from '@nestjs/common';

import { DeleteLocationUseCase } from '@/domain/stock/application/use-cases/location/delete-location';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  DeleteLocationParams,
  paramsValidationPipe,
} from './schemas/delete-location-schema';

@Controller('locations')
export class DeleteLocationController {
  constructor(
    private readonly _deleteLocationUseCase: DeleteLocationUseCase,
  ) {}

  @Delete(':id')
  @HttpCode(204)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(
    @Param(paramsValidationPipe) { id }: DeleteLocationParams,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._deleteLocationUseCase.execute({
      authenticateId: user.userId,
      locationId: id,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
