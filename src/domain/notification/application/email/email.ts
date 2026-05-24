export interface EmailData {
  subject: string;
  body: string;
}

export interface TempCompanyCreated {
  companyCnpj: string;
  companyName: string;
  userName: string;
  token: string;
  expiration: Date;
  appUrl: string;
}

export interface ConfirmationCompanyCreated {
  cnpj: string;
  name: string;
  appUrl: string;
}

export interface GenerateNewPasswordToken {
  userName: string;
  token: string;
  expiration: Date;
  appUrl: string;
}

export interface PasswordChanged {
  userName: string;
  appUrl: string;
}

export abstract class EmailHtml {
  abstract tempCompanyCreated({
    companyCnpj,
    companyName,
    userName,
    token,
    expiration,
    appUrl,
  }: TempCompanyCreated): EmailData;

  abstract confirmationCompanyCreated({
    cnpj,
    name,
    appUrl,
  }: ConfirmationCompanyCreated): EmailData;

  abstract generateNewPasswordToken({
    userName,
    token,
    expiration,
    appUrl,
  }: GenerateNewPasswordToken): EmailData;

  abstract passwordChanged({ userName, appUrl }: PasswordChanged): EmailData;
}
