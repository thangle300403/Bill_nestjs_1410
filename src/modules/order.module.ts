import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from 'src/controllers/order.controller';
import { Customer } from 'src/entities/customer.entity';
import { Order } from 'src/entities/order.entity';
import { OrderItem } from 'src/entities/order_item.entity';
import { Product } from 'src/entities/product.entity';
import { Status } from 'src/entities/status.entity';
import { Transport } from 'src/entities/transport.entity';
import { ViewProduct } from 'src/entities/view_product.entity';
import { Ward } from 'src/entities/ward.entity';
import { OrderService } from 'src/services/order.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ViewProduct,
      OrderItem,
      Order,
      Customer,
      Status,
      Ward,
      Product,
      Transport,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrdersModule {}
