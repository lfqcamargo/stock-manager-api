import { faker } from '@faker-js/faker';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  TempPasswordToken,
  TempPasswordTokenProps,
} from '@/domain/user/enterprise/entities/temp-password-token';

export function makeTempPasswordToken(
  override: Partial<TempPasswordTokenProps> = {},
  id?: UniqueEntityID,
) {
  const passwordToken = TempPasswordToken.create(
    {
      token: faker.string.uuid(),
      expirationDate: faker.date.future(),
      userId: new UniqueEntityID(),
      companyId: new UniqueEntityID(),
      ...override,
    },
    id,
  );

  return passwordToken;
}
