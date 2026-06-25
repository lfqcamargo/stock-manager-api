import { Body, Controller, HttpCode, Param, Put } from '@nestjs/common';

import { EditSubLocationUseCase } from '@/domain/stock/application/use-cases/sub-location/edit-sub-location';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  bodyValidationPipe,
  EditSubLocationBody,
  EditSubLocationParams,
  paramsValidationPipe,
} from './schemas/edit-sub-location-schema';

@Controller('sub-locations')
export class EditSubLocationController {
  constructor(
    private readonly _editSubLocationUseCase: EditSubLocationUseCase,
  ) {}

  @Put(':id')
  @HttpCode(204)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(
    @Param(paramsValidationPipe) { id }: EditSubLocationParams,
    @Body(bodyValidationPipe) body: EditSubLocationBody,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._editSubLocationUseCase.execute({
      authenticateId: user.userId,
      subLocationId: id,
      code: body.code,
      name: body.name,
      description: body.description,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
