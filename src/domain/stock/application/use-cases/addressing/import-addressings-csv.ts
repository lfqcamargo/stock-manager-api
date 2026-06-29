import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { InvalidCsvFormatError } from '@/domain/shared/csv/errors/invalid-csv-format-error';
import { InvalidImportModeError } from '@/domain/shared/csv/errors/invalid-import-mode-error';
import { ImportMode } from '@/domain/shared/csv/import-mode';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Addressing } from '../../../enterprise/entities/addressing';
import { AddressingsRepository } from '../../repositories/addressings-repository';
import { LocationsRepository } from '../../repositories/locations-repository';
import { MaterialsRepository } from '../../repositories/materials-repository';
import { PositionsRepository } from '../../repositories/positions-repository';
import { RowsRepository } from '../../repositories/rows-repository';
import { ShelfsRepository } from '../../repositories/shelfs-repository';
import { SubLocationsRepository } from '../../repositories/sub-locations-repository';
import { AddressingHasBalanceError } from './errors/addressing-has-balance-error';

export interface AddressingCsvRow {
  locationCode: string;
  subLocationCode: string;
  rowCode: string;
  shelfCode: string;
  positionCode: string;
  materialCode?: string;
  active?: boolean;
}

interface ImportAddressingsCsvUseCaseRequest {
  authenticateId: string;
  mode: string;
  rows: AddressingCsvRow[];
}

type ImportAddressingsCsvUseCaseResponse = Either<
  | UserNotFoundError
  | UserNotAllowedError
  | InvalidImportModeError
  | InvalidCsvFormatError
  | AddressingHasBalanceError,
  { imported: number; skipped: number }
>;

@Injectable()
export class ImportAddressingsCsvUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _locationsRepository: LocationsRepository,
    private readonly _subLocationsRepository: SubLocationsRepository,
    private readonly _rowsRepository: RowsRepository,
    private readonly _shelfsRepository: ShelfsRepository,
    private readonly _positionsRepository: PositionsRepository,
    private readonly _addressingsRepository: AddressingsRepository,
    private readonly _materialsRepository: MaterialsRepository,
  ) {}

  async execute({
    authenticateId,
    mode,
    rows,
  }: ImportAddressingsCsvUseCaseRequest): Promise<ImportAddressingsCsvUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    if (!Object.values(ImportMode).includes(mode as ImportMode))
      return left(new InvalidImportModeError());

    if (rows.length === 0)
      return left(new InvalidCsvFormatError('File is empty or has no rows.'));

    const firstRow = rows[0];
    const requiredCols = [
      'locationCode',
      'subLocationCode',
      'rowCode',
      'shelfCode',
      'positionCode',
    ];
    for (const col of requiredCols) {
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
      const hasBalance = await this._hasPositiveBalance(companyId);
      if (hasBalance) return left(new AddressingHasBalanceError());
      await this._addressingsRepository.deleteMany({ companyId });
    }

    let imported = 0;
    let skipped = 0;

    for (const row of rows) {
      const locationCode = row.locationCode?.trim().toUpperCase();
      const subLocationCode = row.subLocationCode?.trim().toUpperCase();
      const rowCode = row.rowCode?.trim().toUpperCase();
      const shelfCode = row.shelfCode?.trim().toUpperCase();
      const positionCode = row.positionCode?.trim().toUpperCase();
      if (
        !locationCode ||
        !subLocationCode ||
        !rowCode ||
        !shelfCode ||
        !positionCode
      ) {
        skipped++;
        continue;
      }

      const [location, subLocation, rowEntity, shelf, position] =
        await Promise.all([
          this._locationsRepository.findByCode(companyId, locationCode),
          this._subLocationsRepository.findByCode(companyId, subLocationCode),
          this._rowsRepository.findByCode(companyId, rowCode),
          this._shelfsRepository.findByCode(companyId, shelfCode),
          this._positionsRepository.findByCode(companyId, positionCode),
        ]);

      if (!location || !subLocation || !rowEntity || !shelf || !position) {
        skipped++;
        continue;
      }

      let materialId: UniqueEntityID | null = null;
      if (row.materialCode?.trim()) {
        const material = await this._materialsRepository.findByCode(
          companyId,
          row.materialCode.trim().toUpperCase(),
        );
        if (!material) {
          skipped++;
          continue;
        }
        materialId = material.id;
      }

      const active = row.active ?? true;
      const existing = await this._addressingsRepository.findByAddress({
        companyId,
        locationId: location.id.toString(),
        subLocationId: subLocation.id.toString(),
        rowId: rowEntity.id.toString(),
        shelfId: shelf.id.toString(),
        positionId: position.id.toString(),
      });

      if (existing) {
        if (importMode === ImportMode.ADD_NEW) {
          skipped++;
          continue;
        }
        existing.materialId = materialId;
        existing.active = active;
        await this._addressingsRepository.update(existing);
      } else {
        await this._addressingsRepository.create(
          Addressing.create({
            companyId: new UniqueEntityID(companyId),
            locationId: location.id,
            subLocationId: subLocation.id,
            rowId: rowEntity.id,
            shelfId: shelf.id,
            positionId: position.id,
            materialId,
            amount: 0,
            active,
          }),
        );
      }
      imported++;
    }

    return right({ imported, skipped });
  }

  private async _hasPositiveBalance(companyId: string): Promise<boolean> {
    const { data } = await this._addressingsRepository.fetchAll(
      { companyId, minAmount: 0.001 },
      { page: 1, itemsPerPage: 1 },
    );
    return data.length > 0;
  }
}
