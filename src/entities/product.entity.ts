import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('product')
export class Product {
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
}
