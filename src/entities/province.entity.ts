import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Transport } from './transport.entity';
import { Ward } from './ward.entity';

@Entity('province')
export class Province {
  @PrimaryColumn({ type: 'varchar', length: 5 })
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 30 })
  type: string;

  @OneToMany(() => Ward, (ward) => ward.province)
  wards: Ward[];

  @OneToMany(() => Transport, (transport) => transport.province)
  transports: Transport[];
}
