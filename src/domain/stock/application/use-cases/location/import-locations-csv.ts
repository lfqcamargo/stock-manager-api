import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { InvalidCsvFormatError } from '@/domain/shared/csv/errors/invalid-csv-format-error';
import { InvalidImportModeError } from '@/domain/shared/csv/errors/invalid-import-mode-error';
import { ImportMode } from '@/domain/shared/csv/import-mode';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Location } from '../../../enterprise/entities/location';
import { LocationsRepository } from '../../repositories/locations-repository';

export interface LocationCsvRow {
  code: string;
  name: string;
  description?: string;
}

interface ImportLocationsCsvUseCaseRequest {
  authenticateId: string;
  mode: string;
  rows: LocationCsvRow[];
}

type ImportLocationsCsvUseCaseResponse = Either<
  | UserNotFoundError
  | UserNotAllowedError
  | InvalidImportModeError
  | InvalidCsvFormatError,
  { imported: number; skipped: number }
>;

@Injectable()
export class ImportLocationsCsvUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _locationsRepository: LocationsRepository,
  ) {}

  async execute({
    authenticateId,
    mode,
    rows,
  }: ImportLocationsCsvUseCaseRequest): Promise<ImportLocationsCsvUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    if (!Object.values(ImportMode).includes(mode as ImportMode))
      return left(new InvalidImportModeError());

    if (rows.length === 0)
      return left(new InvalidCsvFormatError('File is empty or has no rows.'));

    const firstRow = rows[0];
    for (const col of ['code', 'name']) {
      if (!(col in firstRow))
        return left(
          new InvalidCsvFormatError(
            `Missing required column "${col}". Found: ${Object.keys(firstRow).join(', ')}.`,
          ),
        );
    }

    const companyId = user.companyId.toString();
    const importMode = mode as ImportMode;

    if (importMode === ImportMode.RESET) {
      await this._locationsRepository.deleteMany({ companyId });
    }

    let imported = 0;
    let skipped = 0;

    for (const row of rows) {
      const code = row.code?.trim().toUpperCase();
      const name = row.name?.trim();
      if (!code || !name) {
        skipped++;
        continue;
      }

      const existing = await this._locationsRepository.findByCode(
        companyId,
        code,
      );

      if (existing) {
        if (importMode === ImportMode.ADD_NEW) {
          skipped++;
          continue;
        }
        existing.name = name;
        existing.description = row.description?.trim() ?? undefined;
        await this._locationsRepository.update(existing);
      } else {
        await this._locationsRepository.create(
          Location.create({
            companyId: new UniqueEntityID(companyId),
            code,
            name,
            description: row.description?.trim() ?? undefined,
          }),
        );
      }
      imported++;
    }

    return right({ imported, skipped });
  }
}
