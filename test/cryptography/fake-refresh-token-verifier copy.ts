import { RefreshTokenVerifier } from '@/domain/shared/application/cryptography/refresh-token-verifier';

export class FakeRefreshTokenVerifier implements RefreshTokenVerifier {
  constructor(private readonly tokenToUserId: Map<string, string>) {}

  verify(token: string): Promise<{ userId: string } | null> {
    const userId = this.tokenToUserId.get(token);
    return Promise.resolve(userId ? { userId } : null);
  }
}
