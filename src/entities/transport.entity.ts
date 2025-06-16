import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Province } from './province.entity';

@Entity('transport')
export class Transport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'province_id', type: 'varchar', length: 5 })
  provinceId: number;

  @Column({ type: 'int' })
  price: number;

  @ManyToOne(() => Province, (province) => province.transports)
  @JoinColumn({ name: 'province_id' })
  province: Province;
}
