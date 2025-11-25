/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { VnpayService } from 'nestjs-vnpay';
import { Request, Response } from 'express';
import { OrderService } from 'src/services/order.service';
import { CartItem } from 'src/type/formattedOrderItem';
import { ConfigService } from '@nestjs/config';

@Controller('vnpay')
export class VnpayController {
  constructor(
    private readonly vnpayService: VnpayService,
    private readonly orderService: OrderService,
    private readonly configService: ConfigService,
  ) {}

  // 🏦 Bước 1: Tạo link thanh toán
  @Post('create')
  async createPayment(
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const vnpReUrl = this.configService.get<string>('VNP_RETURNURL') || '';
    const order = await this.orderService.createOrder(body);

    // 💰 2️⃣ Tính tổng tiền từ cartItems FE gửi lên
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const cartItems: CartItem[] = body.cartItems || [];
    const totalAmount = cartItems.reduce(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (sum: number, item: any) => sum + item.sale_price * item.qty,
      0,
    );

    const paymentUrl = this.vnpayService.buildPaymentUrl({
      vnp_Amount: totalAmount,
      vnp_IpAddr: req.ip || '127.0.0.1',
      vnp_TxnRef: order.id.toString(),
      vnp_OrderInfo: `Thanh toán đơn hàng #${order.id}`,
      vnp_ReturnUrl: vnpReUrl,
    });

    return res.json({ paymentUrl });
  }

  // 🧾 Bước 2: VNPay gọi lại return URL
  @Get('return')
  async handleReturn(@Query() query: any, @Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = await this.vnpayService.verifyReturnUrl(query);

    console.log('📩 Return từ VNPay:', query);

    if (result.isSuccess) {
      res.send('✅ Thanh toán thành công!');
    } else {
      res.send('❌ Thanh toán thất bại!');
    }
  }

  @Get('ipn')
  async handleIPN(@Query() query: any, @Res() res: Response) {
    console.log('📩 IPN từ VNPay:', query);

    try {
      const result = await this.vnpayService.verifyReturnUrl(query);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (result.isSuccess && query.vnp_ResponseCode === '00') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const orderId = query.vnp_TxnRef; // mã đơn hàng bạn gửi khi buildPaymentUrl()
        console.log(`🔔 Xác nhận thanh toán cho đơn hàng #${orderId}`);
        // Cập nhật trạng thái "paid"
        await this.orderService.markOrderAsPaid(orderId);
        console.log(`✅ Thanh toán thành công cho đơn hàng #${orderId}`);

        return res.json({ RspCode: '00', Message: 'Confirm Success' });
      }

      console.warn('❌ Checksum sai hoặc ResponseCode khác 00');
      return res.json({ RspCode: '97', Message: 'Invalid Signature' });
    } catch (error) {
      console.error('❌ Lỗi IPN:', error);
      return res.json({ RspCode: '99', Message: 'Unknown error' });
    }
  }
}
