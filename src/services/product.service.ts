import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { FindOptionsWhere } from 'typeorm';
import { CategoryProduct } from 'src/type/product';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async getProducts(
    page: number,
    featured: number,
    latest: number,
    itemPerPage: number,
  ) {
    const skip = (page - 1) * itemPerPage;

    const where: FindOptionsWhere<Product> = {};
    if (featured === 1) where.featured = 1;

    const [items, totalItem] = await this.productRepository.findAndCount({
      where,
      order: latest === 1 ? { createdDate: 'DESC' } : { id: 'DESC' },
      skip,
      take: itemPerPage,
    });

    const formattedItems = items.map((item) => ({
      id: item.id,
      barcode: item.barcode,
      sku: item.sku,
      name: item.name,
      price: item.price,
      discount_percentage: item.discountPercentage,
      discount_from_date: item.discountFromDate,
      discount_to_date: item.discountToDate,
      featured_image: `${process.env.IMAGE_BASE_URL}${item.featuredImage}`,
      inventory_qty: item.inventoryQty,
      category_id: item.categoryId,
      brand_id: item.brandId,
      created_date: item.createdDate,
      description: (item.description || '').replace(/<\/?[^>]+(>|$)/g, ''),
      star: item.star,
      featured: item.featured,
      sale_price: item.price.toString(),
      VIEW_NAME: 'view_product',
      TABLE_NAME: 'product',
      SELECT_ALL_QUERY: 'SELECT * FROM view_product',
    }));

    const totalPage = Math.ceil(totalItem / itemPerPage);

    return {
      items: formattedItems,
      totalItem,
      pagination: {
        page: page.toString(),
        totalPage,
      },
    };
  }

  async getProductsByCategory(itemPerPage: number) {
    const categories = await this.categoryRepository.find();
    const categoryProducts: CategoryProduct[] = [];

    for (const category of categories) {
      const [items, totalItem] = await this.productRepository.findAndCount({
        where: { categoryId: category.id },
        order: { createdDate: 'DESC' },
        take: itemPerPage,
      });

      const formattedItems = items.map((item) => ({
        id: item.id,
        barcode: item.barcode,
        sku: item.sku,
        name: item.name,
        price: item.price,
        discount_percentage: item.discountPercentage,
        discount_from_date: item.discountFromDate,
        discount_to_date: item.discountToDate,
        featured_image: `${process.env.IMAGE_BASE_URL}${item.featuredImage}`,
        inventory_qty: item.inventoryQty,
        category_id: item.categoryId,
        brand_id: item.brandId,
        created_date: item.createdDate,
        description: (item.description || '').replace(/<\/?[^>]+(>|$)/g, ''),
        star: item.star,
        featured: item.featured,
        sale_price: item.price.toString(),
        VIEW_NAME: 'view_product',
        TABLE_NAME: 'product',
        SELECT_ALL_QUERY: 'SELECT * FROM view_product',
      }));

      const totalPage = Math.ceil(totalItem / itemPerPage);

      categoryProducts.push({
        categoryName: category.name,
        items: formattedItems,
        totalItem,
        pagination: {
          page: '1',
          totalPage,
        },
      });
    }

    return categoryProducts;
  }
}
