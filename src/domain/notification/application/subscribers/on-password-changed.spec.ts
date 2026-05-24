import { FakeAppConfig } from 'test/config/fake-app-config';
import { FakeEmailTemplate } from 'test/email/fake-email-template';
import { makeUser } from 'test/factories/make-user';
import { InMemoryEmailsRepository } from 'test/repositories/in-memory-emails-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { FakeEmailSender } from 'test/services/fake-email-sender';
import { beforeEach, describe, expect, it } from 'vitest';

import { DomainEvents } from '@/core/events/domain-events';

import { SendEmailUseCase } from '../use-cases/send-email';
import { OnPasswordChanged } from './on-password-changed';

let inMemoryEmailsRepository: InMemoryEmailsRepository;
let fakeEmailSender: FakeEmailSender;
let sendEmail: SendEmailUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let fakeConfig: FakeAppConfig;
let emailHtml: FakeEmailTemplate;

describe('On Change Password', () => {
  beforeEach(() => {
    DomainEvents.clearHandlers();

    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryEmailsRepository = new InMemoryEmailsRepository();
    fakeConfig = new FakeAppConfig();
    fakeEmailSender = new FakeEmailSender();
    emailHtml = new FakeEmailTemplate();
    sendEmail = new SendEmailUseCase(inMemoryEmailsRepository, fakeEmailSender);

    new OnPasswordChanged(fakeConfig, sendEmail, emailHtml);
  });

  it('should send a password change email when password is changed', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    user.updatePassword('new-password');
    await inMemoryUsersRepository.update(user);

    const sentEmail = fakeEmailSender.sentEmails[0];
    expect(sentEmail).toBeDefined();
    expect(sentEmail.to).toBe(user.email);
    expect(sentEmail.body).toContain(user.name);
  });
});
