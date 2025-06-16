import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Customer } from './customer.entity';
import { Ward } from './ward.entity';
import { Status } from './status.entity';
import { OrderItem } from './order_item.entity';

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'datetime' })
  created_date: Date;

  @Column({ type: 'int' })
  order_status_id: number;

  @Column({ type: 'int' })
  staff_id: number;

  @Column({ type: 'int' })
  customer_id: number;

  @Column({ type: 'varchar', length: 5 })
  shipping_ward_id: string;

  @Column({ type: 'varchar', length: 100 })
  shipping_fullname: string;

  @Column({ type: 'varchar', length: 15 })
  shipping_mobile: string;

  @Column({ type: 'tinyint' })
  payment_method: number;

  @Column({ type: 'varchar', length: 200 })
  shipping_housenumber_street: string;

  @Column({ type: 'int' })
  shipping_fee: number;

  @Column({ type: 'date', nullable: true })
  delivered_date: Date;

  @ManyToOne(() => Customer, (customer) => customer.orders)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => Ward, (ward) => ward.orders)
  @JoinColumn({ name: 'shipping_ward_id' })
  shipping_ward: Ward;

  @ManyToOne(() => Status)
  @JoinColumn({ name: 'order_status_id' })
  status: Status;

  @OneToMany(() => OrderItem, (order_item) => order_item.order)
  order_item: OrderItem[];
}
