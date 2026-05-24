import { Injectable } from '@nestjs/common';
import { TempPasswordTokenCreatedEvent } from 'src/domain/user/enterprise/events/temp-password-token-created.event';

import { DomainEvents } from '@/core/events/domain-events';
import { AppConfig } from '@/domain/shared/application/config/app-config';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';

import { EmailHtml } from '../email/email';
import { SendEmailUseCase } from '../use-cases/send-email';

@Injectable()
export class OnTempPasswordTokenCreated {
  constructor(
    private readonly _appConfig: AppConfig,
    private readonly _sendEmail: SendEmailUseCase,
    private readonly _email: EmailHtml,
    private readonly _usersRepository: UsersRepository,
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendPasswordChangeEmail.bind(this),
      TempPasswordTokenCreatedEvent.name,
    );
  }

  private async sendPasswordChangeEmail(event: unknown) {
    if (!(event instanceof TempPasswordTokenCreatedEvent)) return;

    const { tempPasswordToken, userId } = event;

    const user = await this._usersRepository.findById(userId);

    if (!user) return;

    const emailData = this._email.generateNewPasswordToken({
      userName: user.name,
      token: tempPasswordToken.token,
      expiration: tempPasswordToken.expirationDate,
      appUrl: this._appConfig.appUrl,
    });

    await this._sendEmail.execute({
      to: userId,
      subject: emailData.subject,
      body: emailData.body,
    });
  }
}
