import { FakeAppConfig } from 'test/config/fake-app-config';
import { FakeEmailTemplate } from 'test/email/fake-email-template';
import { makeTempUser } from 'test/factories/make-temp-user';
import { InMemoryEmailsRepository } from 'test/repositories/in-memory-emails-repository';
import { InMemoryTempUsersRepository } from 'test/repositories/in-memory-temp-users-repository';
import { FakeEmailSender } from 'test/services/fake-email-sender';

import { DomainEvents } from '@/core/events/domain-events';

import { SendEmailUseCase } from '../use-cases/send-email';
import { OnTempUserCreated } from './on-temp-user-created';

let inMemoryTempUsersRepository: InMemoryTempUsersRepository;
let inMemoryEmailsRepository: InMemoryEmailsRepository;
let fakeEmailSender: FakeEmailSender;
let fakeConfig: FakeAppConfig;
let sendEmail: SendEmailUseCase;
let emailHtml: FakeEmailTemplate;

describe('On Temp User Created', () => {
  beforeEach(() => {
    DomainEvents.clearHandlers();

    inMemoryTempUsersRepository = new InMemoryTempUsersRepository();
    inMemoryEmailsRepository = new InMemoryEmailsRepository();
    fakeEmailSender = new FakeEmailSender();
    fakeConfig = new FakeAppConfig();
    emailHtml = new FakeEmailTemplate();
    sendEmail = new SendEmailUseCase(inMemoryEmailsRepository, fakeEmailSender);

    new OnTempUserCreated(fakeConfig, sendEmail, emailHtml);
  });

  it('should send a welcome email when temp user is created', async () => {
    const tempUser = makeTempUser();
    await inMemoryTempUsersRepository.create(tempUser);

    const sentEmail = fakeEmailSender.sentEmails[0];

    expect(sentEmail).toBeDefined();
    expect(sentEmail.to).toBe(tempUser.email);
    expect(sentEmail.body).toContain(tempUser.name);
    expect(sentEmail.body).toContain(tempUser.token);
  });
});
