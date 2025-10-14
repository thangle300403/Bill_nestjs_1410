// src/guards/jwt-auth.guard.ts
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtBlacklistService } from '../services/jwt-blacklist.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private jwtBlacklistService: JwtBlacklistService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<{ cookies?: { access_token?: unknown } }>();

    const token =
      typeof req.cookies?.access_token === 'string'
        ? req.cookies.access_token
        : undefined;

    if (!token) throw new UnauthorizedException('Missing access token');

    const blacklisted =
      await this.jwtBlacklistService.isTokenBlacklisted(token);
    if (blacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }

    const canActivateResult = await super.canActivate(context);
    if (typeof canActivateResult === 'boolean') {
      return canActivateResult;
    }
    if (
      'subscribe' in canActivateResult &&
      typeof canActivateResult.subscribe === 'function'
    ) {
      // If Observable, convert to Promise and return boolean
      return await new Promise<boolean>((resolve, reject) => {
        canActivateResult.subscribe({
          next: resolve,
          error: reject,
        });
      });
    }
    return false;
  }
}
