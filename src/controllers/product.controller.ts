import {
  Controller,
  Get,
  Query,
  Param,
  Res,
  HttpStatus,
  Post,
  Body,
  Req,
} from '@nestjs/common';
import { Response } from 'express';
import { ProductService } from '../services/product.service';
import { CommentService } from '../services/comment.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { formatProduct } from 'src/utils/format-product.util';

@Controller('api/v1/products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly commentService: CommentService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  async index(
    @Query('page') page: string = '1',
    @Query('featured') featured: string,
    @Query('latest') latest: string,
    @Query('hierarchy') hierarchy: string,
    @Query('item_per_page') itemPerPage: string = '10',
    @Query('category_id') categoryId?: string,
    @Query('priceRange') priceRange?: string,
    @Query('sort') sort?: string,
    @Query('search') search?: string,
    @Query('discount') discount = '0',
  ) {
    const parsedDiscount = Number(discount);
    if (Number(hierarchy) === 1) {
      return this.productService.getProductsByCategory(Number(itemPerPage));
    } else {
      return this.productService.getProducts(
        Number(page),
        Number(featured),
        Number(latest),
        Number(itemPerPage),
        Number(categoryId),
        priceRange,
        sort,
        search,
        parsedDiscount,
      );
    }
  }

  @Get(':slug')
  async getProductDetail(@Param('slug') slug: string, @Res() res: Response) {
    try {
      const productDetail = await this.productService.getSingleProduct(slug);
      return res.status(HttpStatus.OK).json(productDetail);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Product not found';
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message, statusCode: 404 });
    }
  }

  @Get(':id/comments')
  async getComments(@Param('id') id: number) {
    return this.commentService.getCommentsByProduct(id);
  }

  @Post(':id/comments')
  async createComment(
    @Param('id') id: number,
    @Body()
    commentData: {
      email: string;
      fullname: string;
      rating: number;
      description: string;
    },
  ) {
    return this.commentService.createComment(id, commentData);
  }

  @Post('by-ids')
  async getProductsByIds(@Body('ids') ids: number[]) {
    return this.productService.getProductsByIds(ids);
  }

  @Post('recommend-with-reason')
  async recommendWithReason(
    @Req() req: Request & { cookies: Record<string, string> },
    @Body('viewedIds') viewedIds: number[],
  ) {
    let userEmail: string | undefined = undefined;
    const token = req.cookies?.access_token ?? null;

    if (token) {
      try {
        const jwtKey = this.configService.get<string>('JWT_KEY') || '';
        const decoded = jwt.verify(token, jwtKey) as { email: string };
        userEmail = decoded.email;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        // Token invalid or expired — treat as guest
        console.warn('[RECOMMEND] Invalid token, fallback to guest mode.');
      }
    }

    const viewedProducts =
      await this.productService.getProductsByIds(viewedIds);

    const rawRecommendations =
      await this.productService.recommendFromViewedAndPurchasedRaw(
        viewedIds,
        userEmail,
      );

    const explanation = await this.productService.explainRecommendation(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      viewedProducts,
      rawRecommendations,
    );

    const recommendations = rawRecommendations.map((p) => formatProduct(p));

    return { explanation, recommendations };
  }

  @Post('product-change')
  async handleChange(@Body() body: { id: number; type: string }) {
    await this.productService.handleProductWebhook(body.id, body.type);
    return { ok: true };
  }
}
