import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Category } from './category.entity';
import { Brand } from './brand.entity';
import { OrderItem } from './order_item.entity';

@Entity('view_product')
export class ViewProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 13 })
  barcode: string;

  @Column({ length: 20 })
  sku: string;

  @Column({ length: 300 })
  name: string;

  @Column()
  price: number;

  @Column({ name: 'discount_percentage', type: 'int', nullable: true })
  discountPercentage: number;

  @Column({ name: 'discount_from_date', type: 'date', nullable: true })
  discountFromDate: string;

  @Column({ name: 'discount_to_date', type: 'date', nullable: true })
  discountToDate: string;

  @Column({ name: 'featured_image', length: 100, nullable: true })
  featuredImage: string;

  @Column({ name: 'inventory_qty', type: 'int' })
  inventoryQty: number;

  @Column({ name: 'category_id', type: 'int' })
  categoryId: number;

  @Column({ name: 'brand_id', type: 'int' })
  brandId: number;

  @Column({ name: 'created_date', type: 'datetime', nullable: true })
  createdDate: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'float', nullable: true })
  star: number;

  @Column({ type: 'tinyint', width: 1, default: 0 })
  featured: number;

  @Column({ type: 'tinyint', width: 1, default: 0 })
  sale_price: number;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Brand, (brand) => brand.products)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @OneToMany(() => OrderItem, (order_item) => order_item.product)
  order_item: OrderItem[];
}
