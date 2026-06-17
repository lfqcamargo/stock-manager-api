import { TempUser } from '../../enterprise/entities/temp-user';

export abstract class TempUsersRepository {
  abstract create(tempuser: TempUser): Promise<void>;
  abstract findByEmail(email: string): Promise<TempUser | null>;
  abstract findByToken(token: string): Promise<TempUser | null>;
  abstract delete(tempuser: TempUser): Promise<void>;
}
