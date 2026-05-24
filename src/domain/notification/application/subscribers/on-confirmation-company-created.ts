import { Injectable } from '@nestjs/common';

import { DomainEvents } from '@/core/events/domain-events';
import { AppConfig } from '@/domain/shared/application/config/app-config';
import { ConfirmationCompanyCreatedEvent } from '@/domain/user/enterprise/events/confirmation-company-created.event';

import { EmailHtml } from '../email/email';
import { SendEmailUseCase } from '../use-cases/send-email';

@Injectable()
export class OnConfirmationCompanyCreated {
  constructor(
    private readonly _appConfig: AppConfig,
    private readonly _sendEmail: SendEmailUseCase,
    private readonly _email: EmailHtml,
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register((event) => {
      void this.sendCompanyCreatedEmail(event);
    }, ConfirmationCompanyCreatedEvent.name);
  }

  private async sendCompanyCreatedEmail(event: unknown) {
    if (!(event instanceof ConfirmationCompanyCreatedEvent)) return;

    const { company } = event;

    const emailData = this._email.confirmationCompanyCreated({
      cnpj: company.cnpj,
      name: company.name,
      appUrl: this._appConfig.appUrl,
    });

    await this._sendEmail.execute({
      to: company.users[0].email,
      subject: emailData.subject,
      body: emailData.body,
    });
  }
}
