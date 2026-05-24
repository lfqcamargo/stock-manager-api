import { Email as PrismaEmail } from '@generated/prisma/client';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Email } from '@/domain/notification/enterprise/entities/email';

export class PrismaEmailMapper {
  static toDomain(raw: PrismaEmail): Email {
    return Email.create(
      {
        to: raw.to,
        subject: raw.subject,
        body: raw.body,
        from: raw.from ?? null,
        status: raw.status,
        observation: raw.observation ?? null,
        retryCount: raw.retryCount,
        createdAt: raw.createdAt,
        sentAt: raw.sentAt ?? null,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(email: Email) {
    return {
      id: email.id.toString(),
      to: email.to,
      subject: email.subject,
      body: email.body,
      from: email.from,
      status: email.status,
      observation: email.observation,
      retryCount: email.retryCount,
      createdAt: email.createdAt,
      sentAt: email.sentAt,
    };
  }
}
