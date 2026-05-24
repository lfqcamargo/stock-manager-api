import { TempPasswordToken } from '../../enterprise/entities/temp-password-token';

export abstract class TempPasswordTokensRepository {
  abstract create(data: TempPasswordToken): Promise<void>;
  abstract findByToken(token: string): Promise<TempPasswordToken | null>;
  abstract deleteByToken(token: string): Promise<void>;
  abstract deleteByUserId(userId: string): Promise<void>;
}
