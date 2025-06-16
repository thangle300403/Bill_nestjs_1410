import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import { Response } from 'express';
import { TransportService } from 'src/services/transport.service';

@Controller('api/v1')
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  @Get('shippingFees/:provinceId')
  async getShippingFee(
    @Param('provinceId', ParseIntPipe) provinceId: number,
    @Res() res: Response,
  ) {
    try {
      const shippingFee =
        await this.transportService.getShippingFeeByProvinceId(provinceId);

      res.send(shippingFee);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định.';
      return res.status(500).json({
        message: 'Lỗi khi lấy phí ship.',
        error: message,
      });
    }
  }
}
