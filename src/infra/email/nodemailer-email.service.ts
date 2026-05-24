import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

import {
  EmailSender,
  SendEmailResponse,
} from '@/domain/notification/application/services/email-sender';
import { Email } from '@/domain/notification/enterprise/entities/email';
import { EnvService } from '@/infra/env/env.service';

@Injectable()
export class RealEmailService implements EmailSender {
  private readonly logger = new Logger(RealEmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly _envService: EnvService) {
    this.transporter = nodemailer.createTransport({
      host: this._envService.get('MAIL_HOST'),
      port: this._envService.get('MAIL_PORT'),
      secure: this._envService.get('MAIL_SECURE'),
      auth: {
        user: this._envService.get('MAIL_USER'),
        pass: this._envService.get('MAIL_PASS'),
      },
    });
  }

  async sendEmail(email: Email): Promise<SendEmailResponse> {
    try {
      await this.transporter.sendMail({
        from: email.from ?? this._envService.get('MAIL_FROM'),
        to: email.to,
        subject: email.subject,
        html: email.body,
      });

      this.logger.log(
        `Email sent to ${email.to} — subject: "${email.subject}"`,
      );

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to send email to ${email.to}: ${message}`);
      return {
        success: false,
        error: message,
      };
    }
  }
}
