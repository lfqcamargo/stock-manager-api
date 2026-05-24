import { Email } from '../../enterprise/entities/email';

export interface SendEmailResponse {
  success: boolean;
  error?: string;
}

export abstract class EmailSender {
  abstract sendEmail(email: Email): Promise<SendEmailResponse>;
}
