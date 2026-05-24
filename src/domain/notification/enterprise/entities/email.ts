import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';

export type EmailStatus = 'pending' | 'sent' | 'failed';

export interface EmailProps {
  to: string;
  subject: string;
  body: string;
  from?: string | null;
  status: EmailStatus;
  observation?: string | null;
  retryCount: number;
  createdAt: Date;
  sentAt?: Date | null;
}

export class Email extends Entity<EmailProps> {
  get to(): string {
    return this.props.to;
  }

  get subject(): string {
    return this.props.subject;
  }

  get body(): string {
    return this.props.body;
  }

  get from(): string | null {
    return this.props.from ?? null;
  }

  get status(): EmailStatus {
    return this.props.status;
  }

  get observation(): string | null {
    return this.props.observation ?? null;
  }

  get retryCount(): number {
    return this.props.retryCount;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get sentAt(): Date | null {
    return this.props.sentAt ?? null;
  }

  get isSent(): boolean {
    return this.props.status === 'sent';
  }

  get isFailed(): boolean {
    return this.props.status === 'failed';
  }

  get isPending(): boolean {
    return this.props.status === 'pending';
  }

  markAsSent(): void {
    this.props.status = 'sent';
    this.props.sentAt = new Date();
    this.props.observation = null;
  }

  markFail(observation: string): void {
    this.props.status = 'failed';
    this.props.observation = observation;
    this.props.retryCount += 1;
  }

  static create(
    props: Optional<EmailProps, 'createdAt' | 'status' | 'retryCount'>,
    id?: UniqueEntityID,
  ): Email {
    return new Email(
      {
        ...props,
        status: props.status ?? 'pending',
        retryCount: props.retryCount ?? 0,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }
}
