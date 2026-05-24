import { HashComparer } from '@/domain/shared/application/cryptography/hash-comparer';
import { HashGenerator } from '@/domain/shared/application/cryptography/hash-generator';

export class FakeHasher implements HashGenerator, HashComparer {
  async hash(plain: string): Promise<string> {
    return Promise.resolve(plain.concat('-hashed'));
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return Promise.resolve(plain.concat('-hashed') === hash);
  }
}
