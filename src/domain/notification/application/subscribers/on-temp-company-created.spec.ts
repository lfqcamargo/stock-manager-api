import { FakeAppConfig } from 'test/config/fake-app-config';
import { FakeEmailTemplate } from 'test/email/fake-email-template';
import { makeTempCompany } from 'test/factories/make-temp-company';
import { InMemoryEmailsRepository } from 'test/repositories/in-memory-emails-repository';
import { InMemoryTempCompaniesRepository } from 'test/repositories/in-memory-temp-companies-repository';
import { FakeEmailSender } from 'test/services/fake-email-sender';

import { DomainEvents } from '@/core/events/domain-events';

import { SendEmailUseCase } from '../use-cases/send-email';
import { OnTempCompanyCreated } from './on-temp-company-created';

let inMemoryTempCompaniesRepository: InMemoryTempCompaniesRepository;
let inMemoryEmailsRepository: InMemoryEmailsRepository;
let fakeEmailSender: FakeEmailSender;
let fakeConfig: FakeAppConfig;
let sendEmail: SendEmailUseCase;
let emailHtml: FakeEmailTemplate;

describe('On Temp Company Created', () => {
  beforeEach(() => {
    DomainEvents.clearHandlers();

    inMemoryTempCompaniesRepository = new InMemoryTempCompaniesRepository();
    inMemoryEmailsRepository = new InMemoryEmailsRepository();
    fakeEmailSender = new FakeEmailSender();
    fakeConfig = new FakeAppConfig();
    emailHtml = new FakeEmailTemplate();
    sendEmail = new SendEmailUseCase(inMemoryEmailsRepository, fakeEmailSender);

    new OnTempCompanyCreated(fakeConfig, sendEmail, emailHtml);
  });

  it('should send a welcome email when temp company is created', async () => {
    const tempCompany = makeTempCompany();
    await inMemoryTempCompaniesRepository.create(tempCompany);

    const sentEmail = fakeEmailSender.sentEmails[0];

    expect(sentEmail).toBeDefined();
    expect(sentEmail.to).toBe(tempCompany.userEmail);
    expect(sentEmail.body).toContain(tempCompany.userName);
    expect(sentEmail.body).toContain(tempCompany.token);
  });
});
