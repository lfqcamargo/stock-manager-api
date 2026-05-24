import { Module } from '@nestjs/common';

import { EmailHtml } from '@/domain/notification/application/email/email';
import { EmailSender } from '@/domain/notification/application/services/email-sender';
import { SendEmailUseCase } from '@/domain/notification/application/use-cases/send-email';

import { AppConfigModule } from '../config/app.config.module';
import { DatabaseModule } from '../database/database.module';
import { EnvModule } from '../env/env.module';
import { FakeEmailService } from './fake-email.service';
import { HtmlEmailService } from './html-email.service';

@Module({
  imports: [DatabaseModule, EnvModule, AppConfigModule],
  providers: [
    {
      provide: EmailSender,
      useClass: FakeEmailService,
    },
    {
      provide: EmailHtml,
      useClass: HtmlEmailService,
    },
    SendEmailUseCase,
  ],
  exports: [EmailSender, SendEmailUseCase, EmailHtml, AppConfigModule],
})
export class EmailModule {}
