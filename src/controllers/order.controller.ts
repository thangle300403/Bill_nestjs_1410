import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { OrderService } from 'src/services/order.service';
import { CartItem } from 'src/type/formattedOrderItem';
import { DeliveryInfo } from 'src/type/address';
import { LoggedUser } from 'src/type/customer';

@Controller('api/v1')
export class OrdersController {
  constructor(
    private readonly orderService: OrderService,
    private readonly configService: ConfigService,
  ) {}

  @Get('orders')
  async getOrders(@Req() req: Request) {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.split(' ')[1] : null;

    if (!token) {
      throw new UnauthorizedException('Access token missing');
    }

    const jwtKey = this.configService.get<string>('JWT_KEY') || '';
    const decoded = jwt.verify(token, jwtKey) as { email: string };

    return await this.orderService.getFormattedOrders(decoded.email);
  }

  @Get('orders/:id')
  async getOrderDetail(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader ? authHeader.split(' ')[1] : null;
      if (!token) throw new UnauthorizedException('Access token missing');

      const jwtKey = this.configService.get<string>('JWT_KEY') || '';
      const decoded = jwt.verify(token, jwtKey) as { email: string };

      const order = await this.orderService.getOrderDetail(decoded.email, id);
      return res.json(order);
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        message: 'Internal server error',
        error: message,
      });
    }
  }

  @Patch('orders/:id/cancel')
  async cancelOrder(@Req() req: Request, @Param('id') id: string) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Access token missing');
    }

    const jwtKey = this.configService.get<string>('JWT_KEY') || '';
    const decoded = jwt.verify(token, jwtKey) as { email: string };

    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      throw new BadRequestException('Invalid order ID');
    }

    return await this.orderService.cancelOrder(decoded.email, orderId);
  }

  @Post('checkout')
  async checkout(
    @Body('cartItems') cartItems: CartItem[],
    @Body('deliveryInfo') deliveryInfo: DeliveryInfo,
    @Body('loggedUser') loggedUser: LoggedUser,
  ) {
    return this.orderService.checkout(cartItems, deliveryInfo, loggedUser);
  }
}
