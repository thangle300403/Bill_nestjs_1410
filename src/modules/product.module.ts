import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from '../controllers/product.controller';
import { ProductService } from '../services/product.service';
import { Product } from '../entities/product.entity';
import { Comment } from '../entities/comment.entity';
import { Category } from '../entities/category.entity';
import { CategoryController } from 'src/controllers/category.controller';
import { CategoryService } from 'src/services/category.service';
import { CommentService } from 'src/services/comment.service';
import { ProductEmbedding } from 'src/entities/product-embedding.entity';
import { OrderItem } from 'src/entities/order_item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Category,
      Comment,
      ProductEmbedding,
      OrderItem,
    ]),
  ],
  controllers: [ProductController, CategoryController],
  providers: [ProductService, CategoryService, CommentService],
})
export class ProductModule {}
