import {
  ConfirmationCompanyCreated,
  EmailData,
  EmailHtml,
  GenerateNewPasswordToken,
  PasswordChanged,
  TempCompanyCreated,
  TempUserCreated,
} from '@/domain/notification/application/email/email';

export class FakeEmailTemplate extends EmailHtml {
  tempCompanyCreated({
    companyName,
    companyCnpj,
    userName,
    token,
    expiration,
  }: TempCompanyCreated): EmailData {
    return {
      subject: `Welcome to ${companyName}!`,
      body: `Hello ${userName},\n\nYour temporary company "${companyName}" with CNPJ ${companyCnpj} has been created. Please use the following token to complete your registration: ${token}. This token will expire on ${expiration.toLocaleString()}.\n\nBest regards,\nThe Team`,
    };
  }

  confirmationCompanyCreated({
    cnpj,
    name,
    appUrl,
  }: ConfirmationCompanyCreated): EmailData {
    return {
      subject: `Welcome to ${name}!`,
      body: `Hello, \n\nYour company "${name}" with CNPJ ${cnpj} has been created. Visit our app at ${appUrl} to get started.\n\nBest regards,\nThe Team`,
    };
  }

  generateNewPasswordToken({
    userName,
    token,
    expiration,
  }: GenerateNewPasswordToken): EmailData {
    return {
      subject: `New Password Token for ${userName}`,
      body: `Hello ${userName},\n\nWe have generated a new password token for you account. Please use the following token to reset your password: ${token}. This token will expire on ${expiration.toLocaleString()}.\n\nBest regards,\nThe Team`,
    };
  }

  passwordChanged({ userName }: PasswordChanged): EmailData {
    return {
      subject: `Password Changed for ${userName}`,
      body: `Hello ${userName},\n\nYour password has been changed successfully.\n\nBest regards,\nThe Team`,
    };
  }

  tempUserCreated({
    name,
    token,
    expiration,
    appUrl,
  }: TempUserCreated): EmailData {
    return {
      subject: `Welcome to ${name}!`,
      body: `Hello, \n\nYour user "${name}" has been created. Visit our app at ${appUrl} to get started.\n\nBest regards,\nThe Team
      Please use the following token to complete your registration: ${token}. This token will expire on ${expiration.toLocaleString()}.\n\nBest regards,\nThe Team`,
    };
  }
}
