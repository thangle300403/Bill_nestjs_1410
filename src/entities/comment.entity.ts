import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('comment')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  product_id: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ length: 100 })
  email: string;

  @Column({ length: 100 })
  fullname: string;

  @Column({ type: 'float', nullable: true })
  star: number;

  @Column({ type: 'datetime' })
  created_date: Date;

  @Column({ type: 'text', nullable: true })
  description: string;
}
