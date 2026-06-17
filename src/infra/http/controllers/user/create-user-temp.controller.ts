import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { CreateTempUserUseCase } from '@/domain/user/application/use-cases/create-temp-user';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  bodyValidationPipe,
  CreateTempUserBody,
} from './schemas/create-temp-user-schema';

@Controller('/users')
export class CreateUserTempController {
  constructor(private readonly _createTempUserUseCase: CreateTempUserUseCase) {}

  @Post()
  @HttpCode(201)
  @Roles(UserRole.ADMIN)
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(bodyValidationPipe) body: CreateTempUserBody,
  ) {
    const { userId } = user;
    const { email, name, role, password } = body;

    const result = await this._createTempUserUseCase.execute({
      authenticateId: userId,
      email,
      name,
      role,
      password,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
