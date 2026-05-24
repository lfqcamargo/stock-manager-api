import { Injectable } from '@nestjs/common';

import { DomainEvents } from '@/core/events/domain-events';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UpdateLastLoginUserEvent } from '@/domain/user/enterprise/events/update-last-login-user.event';

@Injectable()
export class OnUpdateLastLoginUser {
  constructor(private readonly _usersRepository: UsersRepository) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register((event) => {
      void this.updateLastLogin(event as UpdateLastLoginUserEvent);
    }, UpdateLastLoginUserEvent.name);
  }

  private async updateLastLogin(event: UpdateLastLoginUserEvent) {
    if (!(event instanceof UpdateLastLoginUserEvent)) return;

    event.user.updateLastLoginAt();
    await this._usersRepository.update(event.user);
  }
}
