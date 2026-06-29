import {
  BadRequestException,
  Controller,
  HttpCode,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { ImportPositionsCsvUseCase } from '@/domain/stock/application/use-cases/position/import-positions-csv';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';
import { parseCsvBuffer } from '@/infra/http/utils/parse-csv-buffer';

@Controller('csv/positions')
export class ImportPositionsCsvController {
  constructor(private readonly _useCase: ImportPositionsCsvUseCase) {}

  @Post()
  @HttpCode(200)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async handle(
    @UploadedFile() file: Express.Multer.File,
    @Query('mode') mode: string,
    @CurrentUser() user: UserPayload,
  ) {
    if (!file) throw new BadRequestException('CSV file is required.');

    const rows = parseCsvBuffer(file.buffer);

    const result = await this._useCase.execute({
      authenticateId: user.userId,
      mode,
      rows: rows as any,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);

    return result.value;
  }
}
