import { faker } from '@faker-js/faker';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  TempCompany,
  TempCompanyProps,
} from '@/domain/user/enterprise/entities/temp-company';

export function makeTempCompany(
  override: Partial<TempCompanyProps> = {},
  id?: UniqueEntityID,
) {
  const tempCompany = TempCompany.create(
    {
      companyName: faker.person.fullName(),
      companyCnpj: faker.string.numeric(14),

      userName: faker.person.fullName(),
      userEmail: faker.internet.email(),
      userPassword: faker.internet.password(),

      token: faker.string.uuid(),
      expirationDate: faker.date.future(),
      ...override,
    },
    id,
  );

  return tempCompany;
}
