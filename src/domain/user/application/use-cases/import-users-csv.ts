import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { InvalidCsvFormatError } from '@/domain/shared/csv/errors/invalid-csv-format-error';
import { InvalidImportModeError } from '@/domain/shared/csv/errors/invalid-import-mode-error';
import { ImportMode } from '@/domain/shared/csv/import-mode';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { User, UserRole } from '@/domain/user/enterprise/entities/user';

export interface UserCsvRow {
  name: string;
  email: string;
  password: string;
  role: string;
  active?: string;
}

interface ImportUsersCsvUseCaseRequest {
  authenticateId: string;
  mode: string;
  rows: UserCsvRow[];
}

type ImportUsersCsvUseCaseResponse = Either<
  | UserNotFoundError
  | UserNotAllowedError
  | InvalidImportModeError
  | InvalidCsvFormatError,
  { imported: number; skipped: number }
>;

@Injectable()
export class ImportUsersCsvUseCase {
  constructor(private readonly _usersRepository: UsersRepository) {}

  async execute({
    authenticateId,
    mode,
    rows,
  }: ImportUsersCsvUseCaseRequest): Promise<ImportUsersCsvUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin()) return left(new UserNotAllowedError());

    if (!Object.values(ImportMode).includes(mode as ImportMode))
      return left(new InvalidImportModeError());

    if (rows.length === 0)
      return left(new InvalidCsvFormatError('File is empty or has no rows.'));

    const firstRow = rows[0];
    for (const col of ['name', 'email', 'password', 'role']) {
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
      await this._usersRepository.deleteMany({ companyId });
    }

    let imported = 0;
    let skipped = 0;

    for (const row of rows) {
      const name = row.name?.trim();
      const email = row.email?.trim().toLowerCase();
      const password = row.password?.trim();
      const roleRaw = row.role?.trim().toUpperCase();
      if (!name || !email || !password || !roleRaw) {
        skipped++;
        continue;
      }

      if (!Object.values(UserRole).includes(roleRaw as UserRole)) {
        skipped++;
        continue;
      }

      const role = roleRaw as UserRole;
      const active = parseBool(row.active, true);
      const existing = await this._usersRepository.findByEmail(email);

      if (existing) {
        if (importMode === ImportMode.ADD_NEW) {
          skipped++;
          continue;
        }
        existing.updateName(name);
        existing.changeRole(role);
        if (active) existing.activate();
        else existing.deactivate();
        await this._usersRepository.update(existing);
      } else {
        await this._usersRepository.create(
          User.create({
            companyId: user.companyId,
            name,
            email,
            password,
            role,
            active,
          }),
        );
      }
      imported++;
    }

    return right({ imported, skipped });
  }
}

function parseBool(value: string | undefined, defaultValue: boolean): boolean {
  if (!value?.trim()) return defaultValue;
  return ['true', '1', 'yes', 'sim', 'ativo', 'active'].includes(
    value.trim().toLowerCase(),
  );
}
