import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsOrder,
  Like,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { FindOptionsWhere } from 'typeorm';
import { CategoryProduct } from 'src/type/product';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly configService: ConfigService,
  ) {}

  async getProducts(
    page: number,
    featured: number,
    latest: number,
    itemPerPage: number,
    categoryId?: number,
    priceRange?: string,
    sort?: string,
    search?: string,
  ) {
    const skip = (page - 1) * itemPerPage;

    const where: FindOptionsWhere<Product> = {};
    const order: FindOptionsOrder<Product> = {};

    if (featured === 1) where.featured = 1;
    if (categoryId) where.categoryId = categoryId;

    // 🛒 Price range: "start-end" or "start-greater"
    if (priceRange) {
      const [start, end] = priceRange.split('-');
      if (end === 'greater') {
        where.price = MoreThan(Number(start));
      } else if (!isNaN(Number(start)) && !isNaN(Number(end))) {
        where.price = Between(Number(start), Number(end));
      }
    }

    // 🔍 Search by name
    if (search) {
      where.name = Like(`%${search}%`);
    }

    // 📌 Sorting
    if (latest === 1) {
      order.createdDate = 'DESC';
    } else if (sort) {
      const [field, direction] = sort.split('-');
      const validFields: { [key: string]: keyof Product } = {
        price: 'price',
        alpha: 'name',
        created: 'createdDate',
      };

      const mappedField = validFields[field as keyof typeof validFields];

      if (mappedField) {
        order[mappedField] =
          direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      }
    } else {
      order.id = 'DESC';
    }

    const [items, totalItem] = await this.productRepository.findAndCount({
      where,
      order,
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

  async getSingleProduct(slug: string) {
    if (!slug) {
      throw new NotFoundException('Slug is required');
    }

    const parts = slug.split('-');
    const id = parseInt(parts[parts.length - 1], 10);

    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const featuredImage = `${this.configService.get<string>(
      'IMAGE_BASE_URL',
    )}${product.featuredImage}`;

    const detailProduct = {
      id: product.id,
      barcode: product.barcode,
      sku: product.sku,
      name: product.name,
      price: product.price,
      discount_percentage: product.discountPercentage,
      featured_image: featuredImage,
      inventory_qty: product.inventoryQty,
      category_id: product.categoryId,
      brand_id: product.brandId,
      created_date: product.createdDate,
      description: product.description || '',
      star: product.star,
      featured: product.featured,
      sale_price: product.price.toString(),
      VIEW_NAME: 'view_product',
      TABLE_NAME: 'product',
    };

    const relatedProducts = await this.productRepository.find({
      where: {
        categoryId: product.categoryId,
        id: Not(id), // using query builder alternative below
      },
    });

    const formattedRelated = relatedProducts
      .filter((p) => p.id !== product.id) // ensure we exclude the current product
      .map((related) => ({
        id: related.id,
        barcode: related.barcode,
        sku: related.sku,
        name: related.name,
        price: related.price,
        discount_percentage: related.discountPercentage,
        featured_image: `${this.configService.get<string>(
          'IMAGE_BASE_URL',
        )}${related.featuredImage}`,
        inventory_qty: related.inventoryQty,
        category_id: related.categoryId,
        brand_id: related.brandId,
        created_date: related.createdDate,
        description: related.description || '',
        star: related.star,
        featured: related.featured,
        sale_price: related.price.toString(),
        VIEW_NAME: 'view_product',
        TABLE_NAME: 'product',
        SELECT_ALL_QUERY: 'SELECT * FROM view_product',
      }));

    return {
      ...detailProduct,
      relatedProducts: formattedRelated,
      thumbnailItems: [],
    };
  }
}
