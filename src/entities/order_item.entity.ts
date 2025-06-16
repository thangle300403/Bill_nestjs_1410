import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';
import { Order } from './order.entity';

@Entity('order_item')
export class OrderItem {
  @PrimaryColumn({ name: 'product_id', type: 'int' })
  productId: number;

  @PrimaryColumn({ name: 'order_id', type: 'int' })
  orderId: number;

  @Column({ name: 'qty', type: 'int', nullable: false })
  qty: number;

  @Column({ name: 'unit_price', type: 'int', nullable: false })
  unitPrice: number;

  @Column({ name: 'total_price', type: 'int', nullable: false })
  totalPrice: number;

  @ManyToOne(() => Product, (product) => product.order_item)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Order, (order) => order.order_item)
  @JoinColumn({ name: 'order_id' })
  order?: Order;
}
