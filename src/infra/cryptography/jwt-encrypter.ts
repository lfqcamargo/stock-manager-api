import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import {
  Encrypter,
  EncryptOptions,
} from '@/domain/shared/application/cryptography/encrypter';

@Injectable()
export class JwtEncrypter implements Encrypter {
  constructor(private jwtService: JwtService) {}

  encrypt(
    payload: Record<string, unknown>,
    options?: EncryptOptions,
  ): Promise<string> {
    return this.jwtService.signAsync(payload as object, {
      expiresIn: options?.expiresIn as never,
    });
  }
}
