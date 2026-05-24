import {
  EmailSender,
  SendEmailResponse,
} from '@/domain/notification/application/services/email-sender';
import { Email } from '@/domain/notification/enterprise/entities/email';

export class FakeEmailSender implements EmailSender {
  public sentEmails: Email[] = [];

  async sendEmail(email: Email): Promise<SendEmailResponse> {
    this.sentEmails.push(email);

    return Promise.resolve({ success: true });
  }
}
