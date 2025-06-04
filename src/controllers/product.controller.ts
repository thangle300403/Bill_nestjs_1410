import { Controller, Get, Query } from '@nestjs/common';
import { ProductService } from '../services/product.service';

@Controller('api/v1/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async index(
    @Query('page') page: number = 1,
    @Query('featured') featured: number,
    @Query('latest') latest: number,
    @Query('hierarchy') hierarchy: string,
    @Query('item_per_page') itemPerPage: number = 10,
  ) {
    console.log('hierarchy:', hierarchy, typeof hierarchy);
    if (Number(hierarchy) === 1) {
      return this.productService.getProductsByCategory(itemPerPage);
    } else {
      return this.productService.getProducts(
        page,
        featured,
        latest,
        itemPerPage,
      );
    }
  }
}
