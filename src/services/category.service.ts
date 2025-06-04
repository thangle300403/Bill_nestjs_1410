import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async getCategory() {
    const categories = await this.categoryRepository.find();

    const formattedCategories = categories.map((item) => ({
      id: item.id,
      name: item.name,
    }));

    return {
      items: formattedCategories,
      totalItem: formattedCategories.length,
    };
  }
}
