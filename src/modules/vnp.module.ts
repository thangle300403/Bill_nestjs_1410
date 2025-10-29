import { Module } from '@nestjs/common';
import { VnpayController } from 'src/controllers/vnpay.controller';

@Module({
  controllers: [VnpayController],
})
export class VnpayModule {}
