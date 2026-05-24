import { Injectable } from '@nestjs/common';

import { DomainEvents } from '@/core/events/domain-events';
import { AppConfig } from '@/domain/shared/application/config/app-config';
import { TempCompanyCreatedEvent } from '@/domain/user/enterprise/events/temp-company-created.event';

import { EmailHtml } from '../email/email';
import { SendEmailUseCase } from '../use-cases/send-email';

@Injectable()
export class OnTempCompanyCreated {
  constructor(
    private readonly _appConfig: AppConfig,
    private readonly _sendEmail: SendEmailUseCase,
    private readonly _email: EmailHtml,
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register((event) => {
      void this.sendTempCompanyCreatedEmail(event);
    }, TempCompanyCreatedEvent.name);
  }

  private async sendTempCompanyCreatedEmail(event: unknown) {
    if (!(event instanceof TempCompanyCreatedEvent)) return;

    const { tempCompany } = event;

    const emailData = this._email.tempCompanyCreated({
      companyCnpj: tempCompany.companyCnpj,
      companyName: tempCompany.companyName,

      userName: tempCompany.userName,

      token: tempCompany.token,
      expiration: tempCompany.expirationDate,
      appUrl: this._appConfig.appUrl,
    });

    await this._sendEmail.execute({
      to: tempCompany.userEmail,
      subject: emailData.subject,
      body: emailData.body,
    });
  }
}
