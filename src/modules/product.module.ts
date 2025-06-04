import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from '../controllers/product.controller';
import { ProductService } from '../services/product.service';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { CategoryController } from 'src/controllers/category.controller';
import { CategoryService } from 'src/services/category.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category])],
  controllers: [ProductController, CategoryController],
  providers: [ProductService, CategoryService],
})
export class ProductModule {}
