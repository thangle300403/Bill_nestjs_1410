// src/controllers/internal.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { ProductService } from 'src/services/product.service';

@Controller('internal/products')
export class InternalProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('embed')
  async embed(@Body('productId') productId: number) {
    const product = await this.productService.findById(productId);
    if (!product) {
      return { success: false, message: 'Product not found' };
    }

    await this.productService.generateAndStoreEmbedding(product);
    return { success: true };
  }
}
