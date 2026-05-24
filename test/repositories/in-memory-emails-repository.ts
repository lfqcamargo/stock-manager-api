import { EmailsRepository } from '@/domain/notification/application/repositories/emails-repository';
import { Email } from '@/domain/notification/enterprise/entities/email';

export class InMemoryEmailsRepository implements EmailsRepository {
  public items: Email[] = [];

  async create(email: Email): Promise<void> {
    this.items.push(email);

    return Promise.resolve();
  }
}
