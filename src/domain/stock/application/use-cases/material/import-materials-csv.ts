import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { InvalidCsvFormatError } from '@/domain/shared/csv/errors/invalid-csv-format-error';
import { InvalidImportModeError } from '@/domain/shared/csv/errors/invalid-import-mode-error';
import { ImportMode } from '@/domain/shared/csv/import-mode';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Material } from '../../../enterprise/entities/material';
import { UnitMeasure } from '../../../enterprise/entities/value-objects/unit-measure';
import { GroupsRepository } from '../../repositories/groups-repository';
import { MaterialsRepository } from '../../repositories/materials-repository';

export interface MaterialCsvRow {
  groupCode: string;
  code: string;
  name: string;
  unit: string;
  description?: string;
  active?: boolean;
}

interface ImportMaterialsCsvUseCaseRequest {
  authenticateId: string;
  mode: string;
  rows: MaterialCsvRow[];
}

type ImportMaterialsCsvUseCaseResponse = Either<
  | UserNotFoundError
  | UserNotAllowedError
  | InvalidImportModeError
  | InvalidCsvFormatError,
  { imported: number; skipped: number }
>;

@Injectable()
export class ImportMaterialsCsvUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _groupsRepository: GroupsRepository,
    private readonly _materialsRepository: MaterialsRepository,
  ) {}

  async execute({
    authenticateId,
    mode,
    rows,
  }: ImportMaterialsCsvUseCaseRequest): Promise<ImportMaterialsCsvUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    if (!Object.values(ImportMode).includes(mode as ImportMode))
      return left(new InvalidImportModeError());

    if (rows.length === 0)
      return left(new InvalidCsvFormatError('File is empty or has no rows.'));

    const firstRow = rows[0];
    for (const col of ['groupCode', 'code', 'name', 'unit']) {
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
      await this._materialsRepository.deleteMany({ companyId });
    }

    let imported = 0;
    let skipped = 0;

    for (const row of rows) {
      const groupCode = row.groupCode?.trim().toUpperCase();
      const code = row.code?.trim().toUpperCase();
      const name = row.name?.trim();
      const unitRaw = row.unit?.trim().toUpperCase();
      if (!groupCode || !code || !name || !unitRaw) {
        skipped++;
        continue;
      }

      // Validate unit measure
      let unit: UnitMeasure;
      try {
        unit = UnitMeasure.fromCode(unitRaw);
      } catch {
        skipped++;
        continue;
      }

      // Resolve group by code within this company
      const group = await this._groupsRepository.findByCode(
        companyId,
        groupCode,
      );
      if (!group) {
        skipped++;
        continue;
      }

      const active = row.active ?? true;
      const existing = await this._materialsRepository.findByCode(
        companyId,
        code,
      );

      if (existing) {
        if (importMode === ImportMode.ADD_NEW) {
          skipped++;
          continue;
        }
        existing.name = name;
        existing.description = row.description?.trim() ?? null;
        existing.unit = unit;
        existing.active = active;
        existing.groupId = group.id;
        await this._materialsRepository.update(existing);
      } else {
        await this._materialsRepository.create(
          Material.create({
            companyId: new UniqueEntityID(companyId),
            groupId: group.id,
            code,
            name,
            description: row.description?.trim() ?? null,
            unit,
            active,
          }),
        );
      }
      imported++;
    }

    return right({ imported, skipped });
  }
}
