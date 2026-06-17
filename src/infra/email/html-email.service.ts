import { Injectable } from '@nestjs/common';

import {
  ConfirmationCompanyCreated,
  EmailData,
  EmailHtml,
  GenerateNewPasswordToken,
  TempCompanyCreated,
  TempUserCreated,
} from '@/domain/notification/application/email/email';
import { AppConfig } from '@/domain/shared/application/config/app-config';

import {
  formatDatePtBR,
  loadTemplate,
  renderTemplate,
} from './templates/template-utils';

@Injectable()
export class HtmlEmailService implements EmailHtml {
  constructor(private readonly _appConfig: AppConfig) {}

  tempCompanyCreated(data: TempCompanyCreated): EmailData {
    const template = loadTemplate('temp-company-created');
    const confirmationLink = `${this._appConfig.appUrl}/confirmation-create-company-and-user?token=${data.token}`;
    const formattedExpiration = formatDatePtBR(data.expiration);

    const body = renderTemplate(template, {
      userName: data.userName,
      companyName: data.companyName,
      companyCnpj: data.companyCnpj,
      confirmationLink,
      formattedExpiration,
      year: String(new Date().getFullYear()),
    });

    return {
      subject: '🎉 Bem-vindo à plataforma StockManagers!',
      body: body.trim(),
    };
  }

  confirmationCompanyCreated(data: ConfirmationCompanyCreated): EmailData {
    const template = loadTemplate('confirmation-company-created');
    const loginLink = `${data.appUrl}`;
    const formattedNow = formatDatePtBR(new Date());

    const body = renderTemplate(template, {
      name: data.name,
      cnpj: data.cnpj,
      loginLink,
      formattedNow,
      year: String(new Date().getFullYear()),
    });

    return {
      subject: `✔️ Confirmação: empresa ${data.name} criada com sucesso - StockManagers`,
      body: body.trim(),
    };
  }

  generateNewPasswordToken(data: GenerateNewPasswordToken): EmailData {
    const template = loadTemplate('generate-new-password-token');
    const resetLink = `${this._appConfig.appUrl}/exchange-password-for-token?token=${data.token}`;
    const formattedExpiration = formatDatePtBR(data.expiration);

    const body = renderTemplate(template, {
      userName: data.userName,
      resetLink,
      formattedExpiration,
      year: String(new Date().getFullYear()),
    });

    return {
      subject: '🔑 Recuperação de senha - StockManagers',
      body: body.trim(),
    };
  }

  tempUserCreated(data: TempUserCreated): EmailData {
    const template = loadTemplate('temp-user-created');
    const confirmationLink = `${this._appConfig.appUrl}/confirmation-create-user?token=${data.token}`;
    const formattedExpiration = formatDatePtBR(data.expiration);

    const body = renderTemplate(template, {
      name: data.name,
      confirmationLink,
      formattedExpiration,
      year: String(new Date().getFullYear()),
    });

    return {
      subject: `Welcome to ${data.name}!`,
      body: body.trim(),
    };
  }
}
