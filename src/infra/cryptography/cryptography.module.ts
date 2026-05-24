import { Module } from '@nestjs/common';

import { Encrypter } from '@/domain/shared/application/cryptography/encrypter';
import { HashComparer } from '@/domain/shared/application/cryptography/hash-comparer';
import { HashGenerator } from '@/domain/shared/application/cryptography/hash-generator';
import { RefreshTokenVerifier } from '@/domain/shared/application/cryptography/refresh-token-verifier';

import { BcryptHasher } from './bcrypt-hasher';
import { JwtEncrypter } from './jwt-encrypter';
import { JwtRefreshTokenVerifier } from './jwt-refresh-token-verifier';

@Module({
  providers: [
    { provide: Encrypter, useClass: JwtEncrypter },
    { provide: HashComparer, useClass: BcryptHasher },
    { provide: HashGenerator, useClass: BcryptHasher },
    { provide: RefreshTokenVerifier, useClass: JwtRefreshTokenVerifier },
  ],
  exports: [Encrypter, HashComparer, HashGenerator, RefreshTokenVerifier],
})
export class CryptographyModule {}
