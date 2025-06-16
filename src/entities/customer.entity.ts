import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Ward } from './ward.entity';

@Entity('customer')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 61 })
  password: string;

  @Column({ length: 15 })
  mobile: string;

  @Column({ length: 100 })
  email: string;

  @Column({ length: 20 })
  login_by: string;

  @Column({ type: 'varchar', length: 5 })
  ward_id: string;

  @Column({ length: 200 })
  shipping_name: string;

  @Column({ length: 15 })
  shipping_mobile: string;

  @Column({ length: 200 })
  housenumber_street: string;

  @Column({ type: 'tinyint', width: 4 })
  is_active: number;

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @ManyToOne(() => Ward, (ward) => ward.customers)
  @JoinColumn({ name: 'ward_id' })
  ward: Ward;
}
