import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from 'src/entities/order_item.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrderItemService {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async getPurchasedItemsByEmail(email: string) {
    const items = await this.orderItemRepository.find({
      where: {
        order: {
          customer: { email },
        },
      },
      relations: ['product', 'order', 'order.customer'],
    });

    return items.filter((item) => item.product);
  }
}
