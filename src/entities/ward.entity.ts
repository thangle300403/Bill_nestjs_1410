import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Order } from './order.entity';
import { Customer } from './customer.entity';
import { Province } from './province.entity';

@Entity('ward')
export class Ward {
  @PrimaryColumn({ type: 'varchar', length: 5 })
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 30 })
  type: string;

  @Column({ name: 'province_id', type: 'varchar', length: 5 })
  provinceId: string;

  @ManyToOne(() => Province, (province) => province.wards)
  @JoinColumn({ name: 'province_id' })
  province: Province;

  @OneToMany(() => Order, (order) => order.shipping_ward)
  orders: Order[];

  @OneToMany(() => Customer, (customer) => customer.ward)
  customers: Customer[];
}
