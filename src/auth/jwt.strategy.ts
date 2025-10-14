// src/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Extract token from cookie
        (req: { cookies?: { access_token?: string } }) =>
          req?.cookies?.access_token ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_KEY') || '', // use same as jwt.config.ts
    });
  }

  validate(payload: { id: number; email: string; name: string }) {
    // Automatically attaches payload to req.user
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
    };
  }
}
