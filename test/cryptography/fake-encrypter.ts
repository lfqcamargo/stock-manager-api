import {
  Encrypter,
  EncryptOptions,
} from '@/domain/shared/application/cryptography/encrypter';

export class FakeEncrypter implements Encrypter {
  async encrypt(
    payload: Record<string, unknown>,
    options?: EncryptOptions,
  ): Promise<string> {
    return Promise.resolve(
      JSON.stringify({ ...payload, _expiresIn: options?.expiresIn }),
    );
  }
}
