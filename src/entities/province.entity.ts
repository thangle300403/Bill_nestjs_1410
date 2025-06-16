import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { District } from './district.entity';
import { Transport } from './transport.entity';

@Entity('province')
export class Province {
  @PrimaryColumn({ type: 'varchar', length: 5 })
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 30 })
  type: string;

  @OneToMany(() => District, (district) => district.province)
  districts: District[];

  @OneToMany(() => Transport, (transport) => transport.province)
  transports: Transport[];
}
