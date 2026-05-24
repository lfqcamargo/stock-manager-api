import { Email } from '../../enterprise/entities/email';

export abstract class EmailsRepository {
  abstract create(email: Email): Promise<void>;
}
