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

import {
  MaterialCsvRow,
  ImportMaterialsCsvUseCase,
} from '@/domain/stock/application/use-cases/material/import-materials-csv';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';
import { parseCsvBuffer } from '@/infra/http/utils/parse-csv-buffer';
import { parseBool } from '@/infra/http/utils/parse-bool';

@Controller('csv/materials')
export class ImportMaterialsCsvController {
  constructor(private readonly _useCase: ImportMaterialsCsvUseCase) {}

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

    const rawRows = parseCsvBuffer(file.buffer);
    const rows: MaterialCsvRow[] = rawRows.map((r) => ({
      groupCode: r.groupCode,
      code: r.code,
      name: r.name,
      unit: r.unit,
      description: r.description,
      active: r.active !== undefined ? parseBool(r.active, true) : undefined,
    }));

    const result = await this._useCase.execute({
      authenticateId: user.userId,
      mode,
      rows,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);

    return result.value;
  }
}
