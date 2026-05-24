import { makeUser } from 'test/factories/make-user';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { DomainEvents } from '@/core/events/domain-events';

import { OnUpdateLastLoginUser } from './on-update-last-login-user';

let usersRepository: InMemoryUsersRepository;

describe('OnUpdateLastLoginUser subscriber', () => {
  beforeEach(() => {
    DomainEvents.clearHandlers();

    usersRepository = new InMemoryUsersRepository();

    new OnUpdateLastLoginUser(usersRepository);
  });

  it('should update lastLogin when session is refreshed', async () => {
    const originalLastLogin = new Date(Date.now() - 1000 * 60 * 60);
    const user = makeUser({ lastLogin: originalLastLogin });
    await usersRepository.create(user);

    user.updateLastLogin();
    DomainEvents.dispatchEventsForAggregate(user.id);

    const persisted = await usersRepository.findById(user.id.toString());
    expect(persisted?.lastLogin).toBeInstanceOf(Date);
    expect(persisted?.lastLogin?.getTime()).toBeGreaterThan(
      originalLastLogin.getTime(),
    );
  });
});
