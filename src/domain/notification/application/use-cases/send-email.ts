import { Injectable } from '@nestjs/common';

import { Email } from '../../enterprise/entities/email';
import { EmailsRepository } from '../repositories/emails-repository';
import { EmailSender } from '../services/email-sender';

interface SendEmailUseCaseRequest {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

interface SendEmailUseCaseResponse {
  email: Email;
}

@Injectable()
export class SendEmailUseCase {
  constructor(
    private readonly _emailsRepository: EmailsRepository,
    private readonly _emailSender: EmailSender,
  ) {}

  async execute({
    to,
    subject,
    body,
    from,
  }: SendEmailUseCaseRequest): Promise<SendEmailUseCaseResponse> {
    const email = Email.create({ to, subject, body, from });

    const { success, error } = await this._emailSender.sendEmail(email);

    if (success) {
      email.markAsSent();
    } else {
      email.markFail(error ?? 'Unknown error');
    }

    await this._emailsRepository.create(email);

    return { email };
  }
}
