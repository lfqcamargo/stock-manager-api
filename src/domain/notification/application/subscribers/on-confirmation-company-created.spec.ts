import { FakeAppConfig } from 'test/config/fake-app-config';
import { FakeEmailTemplate } from 'test/email/fake-email-template';
import { makeCompany } from 'test/factories/make-company';
import { makeUser } from 'test/factories/make-user';
import { InMemoryCompaniesRepository } from 'test/repositories/in-memory-companies-repository';
import { InMemoryEmailsRepository } from 'test/repositories/in-memory-emails-repository';
import { FakeEmailSender } from 'test/services/fake-email-sender';

import { DomainEvents } from '@/core/events/domain-events';

import { SendEmailUseCase } from '../use-cases/send-email';
import { OnConfirmationCompanyCreated } from './on-confirmation-company-created';

let inMemoryCompaniesRepository: InMemoryCompaniesRepository;
let inMemoryEmailsRepository: InMemoryEmailsRepository;
let fakeEmailSender: FakeEmailSender;
let fakeConfig: FakeAppConfig;
let sendEmail: SendEmailUseCase;
let emailHtml: FakeEmailTemplate;

describe('On Confirmation Company Created', () => {
  beforeEach(() => {
    DomainEvents.clearHandlers();

    inMemoryCompaniesRepository = new InMemoryCompaniesRepository();
    inMemoryEmailsRepository = new InMemoryEmailsRepository();
    fakeEmailSender = new FakeEmailSender();
    fakeConfig = new FakeAppConfig();
    emailHtml = new FakeEmailTemplate();
    sendEmail = new SendEmailUseCase(inMemoryEmailsRepository, fakeEmailSender);

    new OnConfirmationCompanyCreated(fakeConfig, sendEmail, emailHtml);
  });

  it('should send a confirmation email when confirmation company is created', async () => {
    const company = makeCompany();
    company.users = [makeUser({ companyId: company.id })];
    await inMemoryCompaniesRepository.create(company);

    const sentEmail = fakeEmailSender.sentEmails[0];

    expect(sentEmail).toBeDefined();
    expect(sentEmail.to).toBe(company.users[0].email);
    expect(sentEmail.body).toContain(company.name);
  });
});
