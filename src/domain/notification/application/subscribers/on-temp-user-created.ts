import { Injectable } from '@nestjs/common';

import { DomainEvents } from '@/core/events/domain-events';
import { AppConfig } from '@/domain/shared/application/config/app-config';
import { TempUserCreatedEvent } from '@/domain/user/enterprise/events/temp-user-created.event';

import { EmailHtml } from '../email/email';
import { SendEmailUseCase } from '../use-cases/send-email';

@Injectable()
export class OnTempUserCreated {
  constructor(
    private readonly _appConfig: AppConfig,
    private readonly _sendEmail: SendEmailUseCase,
    private readonly _email: EmailHtml,
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register((event) => {
      void this.sendTempUserCreatedEmail(event);
    }, TempUserCreatedEvent.name);
  }

  private async sendTempUserCreatedEmail(event: unknown) {
    if (!(event instanceof TempUserCreatedEvent)) return;

    const { tempUser } = event;

    const emailData = this._email.tempUserCreated({
      name: tempUser.name,

      token: tempUser.token,
      expiration: tempUser.expirationDate,
      appUrl: this._appConfig.appUrl,
    });

    await this._sendEmail.execute({
      to: tempUser.email,
      subject: emailData.subject,
      body: emailData.body,
    });
  }
}
