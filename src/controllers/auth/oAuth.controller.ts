import {
  Controller,
  Get,
  Res,
  Req,
  UseGuards,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { OAuthUser } from 'src/type/customer';
import { AuthService } from 'src/services/auth.service';
import { CustomerService } from 'src/services/customer.service';
import setAuthCookies from 'src/auth/setAuthCookies';
import { ConfigService } from '@nestjs/config';

// Extend Express Request interface to include 'user'
declare module 'express' {
  interface Request {
    user?: any;
  }
}

@Controller('api/v1')
export class OAuthController {
  constructor(
    private jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly customerService: CustomerService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = req.user as OAuthUser;
    return this.authService.handleOAuthLogin(user, res);
  }

  @Post('confirm-signup')
  async confirmSignup(@Body() body: OAuthUser, @Res() res: Response) {
    const existing = await this.customerService.findByEmail(body.email);
    if (existing) {
      throw new BadRequestException('User already exists');
    }

    const newUser = await this.customerService.createFromOAuth(body);

    setAuthCookies(newUser, res, this.configService);

    return res.json({ user: newUser });
  }

  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  async discordLogin() {}

  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  async discordCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as OAuthUser;
    return this.authService.handleOAuthLogin(user, res);
  }
}
