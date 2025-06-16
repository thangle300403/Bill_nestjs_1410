import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  Headers,
  Query,
  Param,
} from '@nestjs/common';
import { AuthService } from 'src/services/auth.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Controller('api/v1')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  async login(
    @Body() { email, password }: { email: string; password: string },
  ) {
    return this.authService.login(email, password);
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
    console.log('Received GET /active_account with token:', token);
    return this.authService.activateAccount(token);
  }

  @Get('notExistingEmail/:email')
  async checkEmailNotExist(@Param('email') email: string) {
    const exists = await this.authService.checkIfEmailExists(email);
    return !exists;
  }
}
