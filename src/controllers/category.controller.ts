import { Controller, Get } from '@nestjs/common';
import { CategoryService } from '../services/category.service';

@Controller('api/v1/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getCategories() {
    return this.categoryService.getCategory();
  }
}
