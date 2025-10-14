import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  Headers,
  Query,
  Param,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from 'src/services/auth.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { JwtBlacklistService } from 'src/services/jwt-blacklist.service';
import { getTokenExpiry } from 'src/config/tokenExpired';

// Extend Express Request interface to include 'user'
declare module 'express' {
  interface Request {
    user?: any;
  }
}

@Controller('api/v1')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    private readonly jwtBlacklistService: JwtBlacklistService,
  ) {}

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(body.email, body.password, res);
  }

  @Get('me')
  async getMe(@Req() req: Request) {
    const token: string | undefined = (req.cookies as { access_token?: string })
      ?.access_token;

    if (!token) {
      return null;
    }

    try {
      const jwtKey = this.configService.get<string>('JWT_KEY');
      if (!jwtKey) throw new Error('JWT_KEY is not set in environment');

      const payload = jwt.verify(token, jwtKey) as {
        id: number;
        email: string;
        name: string;
      };

      const user = await this.authService.getProfile(payload.id);
      if (!user) {
        throw new UnauthorizedException('Tài khoản không hợp lệ.');
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...safeUser } = user;
      return safeUser;
    } catch (err) {
      console.error('JWT decode error:', err);
      throw new UnauthorizedException('Token không hợp lệ.');
    }
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const accessToken = req.cookies?.access_token;
    if (accessToken) {
      try {
        const expiresAt = getTokenExpiry(accessToken); // decode JWT exp
        await this.jwtBlacklistService.blacklistToken(accessToken, expiresAt);
      } catch (err) {
        console.warn('[Logout] Failed to blacklist token:', err);
      }
    }
    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // 🔒 set true in production with HTTPS
      path: '/', // important: make sure path matches the original set-cookie
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      path: '/',
    });
    return { message: 'Đăng xuất thành công.' };
  }

  @Get('check-login')
  checkLogin(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Không có token xác thực.');
    }
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(
        token,
        this.configService.get<string>('JWT_KEY') || '',
      ) as { id: number; email: string; name: string };

      return {
        isLogin: true,
        user: {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
        },
      };
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc hết hạn.');
    }
  }

  @Post('registers')
  async register(
    @Body()
    body: {
      fullname: string;
      email: string;
      password: string;
      mobile: string;
    },
  ) {
    return this.authService.register(body);
  }

  @Get('active_account')
  async activateAccount(@Query('token') token: string) {
    return this.authService.activateAccount(token);
  }

  @Get('notExistingEmail/:email')
  async checkEmailNotExist(@Param('email') email: string) {
    const exists = await this.authService.checkIfEmailExists(email);
    return !exists;
  }

  @Post('refresh')
  refresh(@Req() req: Request, @Res() res: Response) {
    console.log(
      `[REFRESH CALLED] ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`,
    );
    const rt: string | undefined = (req.cookies as { refresh_token?: string })
      ?.refresh_token;
    if (!rt) throw new UnauthorizedException();

    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!refreshSecret)
      throw new Error('JWT_REFRESH_SECRET is not set in environment');

    let payload: { id: number; email: string };
    try {
      payload = jwt.verify(rt, refreshSecret) as { id: number; email: string };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new UnauthorizedException('Refresh token không hợp lệ.');
    }

    const accessSecret = this.configService.get<string>('JWT_KEY');
    if (!accessSecret) throw new Error('JWT_KEY is not set in environment');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const accessExpiresIn =
      this.configService.get('JWT_ACCESS_EXPIRES_IN') || '15m';
    const accessCookieMaxAge = parseInt(
      this.configService.get('JWT_ACCESS_COOKIE_MAXAGE') || '900000',
    );

    const newAccessToken = jwt.sign(
      { id: payload.id, email: payload.email },
      accessSecret,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { expiresIn: accessExpiresIn },
    );

    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      maxAge: accessCookieMaxAge,
      sameSite: 'lax',
      secure: true,
    });

    return res.json({ success: true });
  }
}
