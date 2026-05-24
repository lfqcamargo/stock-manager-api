import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { RefreshTokenVerifier } from '@/domain/shared/application/cryptography/refresh-token-verifier';

type RefreshPayload = {
  userId?: string;
  typ?: string;
};

@Injectable()
export class JwtRefreshTokenVerifier implements RefreshTokenVerifier {
  constructor(private jwtService: JwtService) {}

  async verify(token: string): Promise<{ userId: string } | null> {
    if (!token) {
      return null;
    }

    try {
      const payload = await this.jwtService.verifyAsync<RefreshPayload>(token, {
        algorithms: ['RS256'],
      });

      if (payload.typ !== 'refresh' || !payload.userId) {
        return null;
      }

      return { userId: payload.userId };
    } catch {
      return null;
    }
  }
}
