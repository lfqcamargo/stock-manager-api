import { Body, Controller, HttpCode, Param, Put } from '@nestjs/common';

import { EditUserUseCase } from '@/domain/user/application/use-cases/edit-user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  bodyValidationPipe,
  EditUserBody,
  EditUserParams,
  paramsValidationPipe,
} from './schemas/edit-user-schema';

@Controller('users/:id')
export class EditUserController {
  constructor(private readonly _editUserUseCase: EditUserUseCase) {}

  @Put()
  @HttpCode(204)
  async handle(
    @Param(paramsValidationPipe) params: EditUserParams,
    @Body(bodyValidationPipe) body: EditUserBody,
    @CurrentUser() user: UserPayload,
  ) {
    const { userId } = user;
    const { name, role, active, photo } = body;

    const result = await this._editUserUseCase.execute({
      userId: params.id,
      authenticateUserId: userId,
      name,
      role,
      active,
      photo: photo ?? null,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
