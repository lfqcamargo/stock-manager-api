import { Body, Controller, HttpCode, Param, Put } from '@nestjs/common';

import { EditLocationUseCase } from '@/domain/stock/application/use-cases/location/edit-location';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  bodyValidationPipe,
  EditLocationBody,
  EditLocationParams,
  paramsValidationPipe,
} from './schemas/edit-location-schema';

@Controller('locations')
export class EditLocationController {
  constructor(private readonly _editLocationUseCase: EditLocationUseCase) {}

  @Put(':id')
  @HttpCode(204)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(
    @Param(paramsValidationPipe) { id }: EditLocationParams,
    @Body(bodyValidationPipe) body: EditLocationBody,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._editLocationUseCase.execute({
      authenticateId: user.userId,
      locationId: id,
      code: body.code,
      name: body.name,
      description: body.description,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
