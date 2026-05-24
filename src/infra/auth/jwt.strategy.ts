import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { z } from 'zod';

import { EnvService } from '../env/env.service';

const tokenPayloadSchema = z
  .object({
    companyId: z.uuid(),
    userId: z.uuid(),
    role: z.string(),
    typ: z.string().optional(),
  })
  .passthrough()
  .refine((data) => data.typ !== 'refresh', {
    message: 'Invalid access token',
  });

export type UserPayload = z.infer<typeof tokenPayloadSchema>;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: EnvService) {
    const publicKey = config.get('JWT_PUBLIC_KEY');

    super({
      jwtFromRequest: (req: Request) => req.cookies?.token as string | null,
      secretOrKey: Buffer.from(publicKey, 'base64'),
      algorithms: ['RS256'],
    });
  }

  validate(payload: UserPayload) {
    return tokenPayloadSchema.parse(payload);
  }
}
