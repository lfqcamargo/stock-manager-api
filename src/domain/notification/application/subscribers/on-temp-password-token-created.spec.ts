import { FakeAppConfig } from 'test/config/fake-app-config';
import { FakeEmailTemplate } from 'test/email/fake-email-template';
import { makeTempPasswordToken } from 'test/factories/make-temp-password-token';
import { makeUser } from 'test/factories/make-user';
import { InMemoryEmailsRepository } from 'test/repositories/in-memory-emails-repository';
import { InMemoryTempPasswordTokensRepository } from 'test/repositories/in-memory-temp-password-tokens-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { FakeEmailSender } from 'test/services/fake-email-sender';

import { DomainEvents } from '@/core/events/domain-events';

import { SendEmailUseCase } from '../use-cases/send-email';
import { OnTempPasswordTokenCreated } from './on-temp-password-token-created';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryTempPasswordTokensRepository: InMemoryTempPasswordTokensRepository;
let inMemoryEmailsRepository: InMemoryEmailsRepository;
let fakeEmailSender: FakeEmailSender;
let fakeConfig: FakeAppConfig;
let sendEmail: SendEmailUseCase;
let emailHtml: FakeEmailTemplate;

describe('On Temp Password Token Created', () => {
  beforeEach(() => {
    DomainEvents.clearHandlers();

    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryTempPasswordTokensRepository =
      new InMemoryTempPasswordTokensRepository();
    inMemoryEmailsRepository = new InMemoryEmailsRepository();
    fakeEmailSender = new FakeEmailSender();
    fakeConfig = new FakeAppConfig();
    emailHtml = new FakeEmailTemplate();
    sendEmail = new SendEmailUseCase(inMemoryEmailsRepository, fakeEmailSender);

    new OnTempPasswordTokenCreated(
      fakeConfig,
      sendEmail,
      emailHtml,
      inMemoryUsersRepository,
    );
  });

  it('should send a password reset email when temp password token is created', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const tempPasswordToken = makeTempPasswordToken({
      userId: user.id,
    });

    await inMemoryTempPasswordTokensRepository.create(tempPasswordToken);

    const sentEmail = fakeEmailSender.sentEmails[0];

    expect(sentEmail).toBeDefined();
    expect(sentEmail.to).toBe(user.email);
    expect(sentEmail.body).toContain(user.name);
    expect(sentEmail.body).toContain(tempPasswordToken.token);
  });
});
