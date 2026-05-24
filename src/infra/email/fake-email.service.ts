import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

import {
  EmailSender,
  SendEmailResponse,
} from '@/domain/notification/application/services/email-sender';
import { Email } from '@/domain/notification/enterprise/entities/email';

@Injectable()
export class FakeEmailService implements EmailSender, OnModuleInit {
  private readonly logger = new Logger(FakeEmailService.name);
  private transporter: nodemailer.Transporter;

  async onModuleInit() {
    const testAccount = await nodemailer.createTestAccount();

    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    this.logger.log(`Ethereal account: ${testAccount.user}`);
  }

  async sendEmail(email: Email): Promise<SendEmailResponse> {
    try {
      const info = await this.transporter.sendMail({
        from: email.from ?? 'noreply@stockmanager.app',
        to: email.to,
        subject: email.subject,
        html: email.body,
      });

      this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);

      return {
        success: true,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
