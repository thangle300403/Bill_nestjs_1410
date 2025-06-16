import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { District } from './district.entity';
import { Order } from './order.entity';
import { Customer } from './customer.entity';

@Entity('ward')
export class Ward {
  @PrimaryColumn({ type: 'varchar', length: 5 })
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 30 })
  type: string;

  @Column({ name: 'district_id', type: 'varchar', length: 5 })
  districtId: string;

  @ManyToOne(() => District, (district) => district.wards)
  @JoinColumn({ name: 'district_id' })
  district: District;

  @OneToMany(() => Order, (order) => order.shipping_ward)
  orders: Order[];

  @OneToMany(() => Customer, (customer) => customer.ward)
  customers: Customer[];
}
