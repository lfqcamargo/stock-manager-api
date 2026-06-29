import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { InvalidCsvFormatError } from '@/domain/shared/csv/errors/invalid-csv-format-error';
import { InvalidImportModeError } from '@/domain/shared/csv/errors/invalid-import-mode-error';
import { ImportMode } from '@/domain/shared/csv/import-mode';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import {
  MovementDirection,
  MovementType,
} from '../../../enterprise/entities/movement-type';
import { MovementTypesRepository } from '../../repositories/movement-types-repository';

export interface MovementTypeCsvRow {
  name: string;
  direction: string;
}

interface ImportMovementTypesCsvUseCaseRequest {
  authenticateId: string;
  mode: string;
  rows: MovementTypeCsvRow[];
}

type ImportMovementTypesCsvUseCaseResponse = Either<
  | UserNotFoundError
  | UserNotAllowedError
  | InvalidImportModeError
  | InvalidCsvFormatError,
  { imported: number; skipped: number }
>;

@Injectable()
export class ImportMovementTypesCsvUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _movementTypesRepository: MovementTypesRepository,
  ) {}

  async execute({
    authenticateId,
    mode,
    rows,
  }: ImportMovementTypesCsvUseCaseRequest): Promise<ImportMovementTypesCsvUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    if (!Object.values(ImportMode).includes(mode as ImportMode))
      return left(new InvalidImportModeError());

    if (rows.length === 0)
      return left(new InvalidCsvFormatError('File is empty or has no rows.'));

    const firstRow = rows[0];
    for (const col of ['name', 'direction']) {
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
      await this._movementTypesRepository.deleteMany({ companyId });
    }

    let imported = 0;
    let skipped = 0;

    for (const row of rows) {
      const name = row.name?.trim();
      const directionRaw = row.direction?.trim().toUpperCase();
      if (!name || !directionRaw) {
        skipped++;
        continue;
      }

      const validDirections = Object.values(MovementDirection) as string[];
      if (!validDirections.includes(directionRaw)) {
        skipped++;
        continue;
      }

      const direction = directionRaw as MovementDirection;
      const existing = await this._movementTypesRepository.findByName(
        companyId,
        name,
      );

      if (existing) {
        if (importMode === ImportMode.ADD_NEW) {
          skipped++;
          continue;
        }
        existing.direction = direction;
        await this._movementTypesRepository.update(existing);
      } else {
        await this._movementTypesRepository.create(
          MovementType.create({
            companyId: new UniqueEntityID(companyId),
            name,
            direction,
          }),
        );
      }
      imported++;
    }

    return right({ imported, skipped });
  }
}
