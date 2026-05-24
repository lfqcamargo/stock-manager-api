import { Injectable } from '@nestjs/common';

import { DomainEvents } from '@/core/events/domain-events';
import { AppConfig } from '@/domain/shared/application/config/app-config';
import { PasswordChangeEvent } from '@/domain/user/enterprise/events/password-change.event';

import { EmailHtml } from '../email/email';
import { SendEmailUseCase } from '../use-cases/send-email';

@Injectable()
export class OnPasswordChanged {
  constructor(
    private readonly _appConfig: AppConfig,
    private readonly _sendEmail: SendEmailUseCase,
    private readonly _email: EmailHtml,
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendPasswordChangeEmail.bind(this),
      PasswordChangeEvent.name,
    );
  }

  private async sendPasswordChangeEmail(event: unknown) {
    if (!(event instanceof PasswordChangeEvent)) return;

    const { user } = event;

    const emailData = this._email.passwordChanged({
      userName: user.name,
      appUrl: this._appConfig.appUrl,
    });

    await this._sendEmail.execute({
      to: user.email,
      subject: emailData.subject,
      body: emailData.body,
    });
  }
}
