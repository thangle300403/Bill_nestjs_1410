import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { CustomerService } from 'src/services/customer.service';
import {
  EnrichedCustomer,
  UpdateInfoDto,
  UpdateShippingDto,
} from 'src/type/customer';

@Controller('api/v1')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly configService: ConfigService,
  ) {}

  @Patch('customers/:id/shipping')
  async updateShippingDefault(
    @Param('id') id: string,
    @Body() body: UpdateShippingDto,
    @Res() res: Response,
  ) {
    try {
      const updatedCustomer: EnrichedCustomer =
        await this.customerService.updateShippingDefault(Number(id), body);
      return res.json(updatedCustomer);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định.';
      return res.status(500).json({
        message: 'Lỗi khi cập nhật thông tin giao hàng.',
        error: message,
      });
    }
  }

  @Patch('customers/:id/account')
  async updateAccount(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() dto: UpdateInfoDto,
  ) {
    const authHeader = req.headers['authorization'] as string | undefined;
    const token = authHeader ? authHeader.split(' ')[1] : null;

    if (!token) {
      throw new UnauthorizedException('Access token missing');
    }

    const jwtKey = this.configService.get<string>('JWT_KEY') || '';
    jwt.verify(token, jwtKey); // ✅ just verify validity – don't need email

    const updated = await this.customerService.updateInfoById(Number(id), dto);
    return updated;
  }

  @Post('forgot_password')
  async forgotPassword(@Body('email') email: string) {
    return await this.customerService.forgotPassword(email);
  }

  @Patch('reset_password')
  async resetPassword(
    @Query('token') token: string,
    @Body('password') password: string,
  ) {
    return await this.customerService.updatePassword(token, password);
  }
}
