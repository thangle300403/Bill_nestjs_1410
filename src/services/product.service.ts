import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsOrder,
  In,
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
import { formatProduct, formatProducts } from 'src/utils/format-product.util';
import { ProductEmbedding } from 'src/entities/product-embedding.entity';
import OpenAI from 'openai';
import { cosineSimilarity } from 'src/utils/embeddingText.util';
import { OrderItem } from 'src/entities/order_item.entity';
import { truncateToMaxTokens } from 'src/utils/tokenize';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly configService: ConfigService,
    @InjectRepository(ProductEmbedding)
    private readonly embeddingRepository: Repository<ProductEmbedding>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  private getOpenAIClient() {
    return new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  private averageEmbeddings(vectors: number[][]): number[] {
    const length = vectors[0].length;
    const result = new Array(length).fill(0);

    for (const vec of vectors) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      vec.forEach((val, i) => (result[i] += val));
    }

    return result.map((val) => val / vectors.length);
  }

  private async getEmbeddingVectorsFromIds(ids: number[]) {
    const embeddings = await this.embeddingRepository.find({
      where: { product: In(ids) },
      relations: ['product'],
    });

    return embeddings;
  }

  async findById(id: number): Promise<Product | null> {
    return await this.productRepository.findOne({
      where: { id },
    });
  }

  async getProducts(
    page: number,
    featured: number,
    latest: number,
    itemPerPage: number,
    categoryId?: number,
    priceRange?: string,
    sort?: string,
    search?: string,
    discount?: number,
  ) {
    const skip = (page - 1) * itemPerPage;

    const where: FindOptionsWhere<Product> = {};
    const order: FindOptionsOrder<Product> = {};

    if (featured === 1) where.featured = 1;
    if (categoryId) where.categoryId = categoryId;
    if (discount === 1) {
      where.discountPercentage = MoreThan(0);
    }

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

    const formattedItems = formatProducts(items);

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

      const formattedItems = formatProducts(items);

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

    const detailProduct = formatProduct(product);

    const relatedProducts = await this.productRepository.find({
      where: {
        categoryId: product.categoryId,
        id: Not(id),
      },
    });

    const formattedRelated = formatProducts(relatedProducts);

    return {
      ...detailProduct,
      relatedProducts: formattedRelated,
      thumbnailItems: [],
    };
  }

  async getProductsByIds(ids: number[]): Promise<any[]> {
    if (!ids.length) return [];

    const products = await this.productRepository.find({
      where: { id: In(ids) },
    });

    return formatProducts(products);
  }

  async generateAndStoreEmbedding(product: Product) {
    const openai = this.getOpenAIClient();

    const inputText = product.name + '\n' + (product.description || '');
    const safeText = truncateToMaxTokens(inputText, 3000);

    const res = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: safeText,
    });

    const embedding = res.data[0].embedding;

    // Upsert into product_embedding table
    const existing = await this.embeddingRepository.findOne({
      where: { product: { id: product.id } },
    });

    if (existing) {
      existing.embedding = embedding;
      await this.embeddingRepository.save(existing);
    } else {
      await this.embeddingRepository.save({
        product,
        embedding,
      });
    }
  }

  async recommendFromViewedAndPurchasedRaw(
    viewedIds: number[],
    userEmail?: string,
    topK = 5,
  ) {
    const purchasedIds: number[] = [];

    if (userEmail) {
      const purchasedItems = await this.orderItemRepository.find({
        where: {
          order: {
            customer: { email: userEmail },
          },
        },
        relations: ['product', 'order', 'order.customer'],
      });

      for (const item of purchasedItems) {
        if (item.product?.id) {
          purchasedIds.push(item.product.id);
        }
      }
    }

    const uniqueIds = [...new Set([...viewedIds, ...purchasedIds])];
    if (uniqueIds.length === 0) return [];

    const userEmbeddings = await this.getEmbeddingVectorsFromIds(uniqueIds);
    if (userEmbeddings.length === 0) return [];

    const meanEmbedding = this.averageEmbeddings(
      userEmbeddings.map((e) => e.embedding),
    );

    const allEmbeddings = await this.embeddingRepository.find({
      relations: ['product'],
    });

    const recommendedProducts = allEmbeddings
      .filter((entry) => {
        const id = entry.product?.id;
        return id && !uniqueIds.includes(id);
      })
      .map((entry) => ({
        ...entry.product,
        score: cosineSimilarity(meanEmbedding, entry.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return recommendedProducts;
  }

  async explainRecommendation(
    viewedProducts: Product[],
    recommendedProducts: Product[],
  ) {
    const openai = this.getOpenAIClient();

    const prompt = `
Bạn là một chuyên gia tư vấn bán hàng cầu lông. Dưới đây là các sản phẩm mà khách hàng đã xem:

${viewedProducts.map((p, i) => `${i + 1}. ${p.name}`).join('\n')}

Từ các sản phẩm đó, hệ thống đề xuất những sản phẩm sau:

${recommendedProducts.map((p, i) => `${i + 1}. ${p.name}`).join('\n')}

Viết một đoạn mô tả ngắn (1-2 câu) giải thích vì sao hệ thống đưa ra đề xuất này, dùng giọng điệu thân thiện và thuyết phục.
`;

    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });

    return res.choices[0].message.content?.trim() || '';
  }

  async handleProductWebhook(id: number, type: string) {
    if (type === 'delete') {
      await this.embeddingRepository.delete({ product: { id } });
      console.log('🗑️ Deleted embedding for product', id);
      return;
    }

    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      console.warn('⚠️ Product not found:', id);
      return;
    }

    await this.generateAndStoreEmbedding(product);
    console.log('✅ Embedded product:', product.name);
  }
}
