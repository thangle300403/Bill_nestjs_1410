import {
  Controller,
  Get,
  Query,
  Param,
  Res,
  HttpStatus,
  Post,
  Body,
} from '@nestjs/common';
import { Response } from 'express';
import { ProductService } from '../services/product.service';
import { CommentService } from '../services/comment.service';

@Controller('api/v1/products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly commentService: CommentService,
  ) {}

  @Get()
  async index(
    @Query('page') page: number = 1,
    @Query('featured') featured: number,
    @Query('latest') latest: number,
    @Query('hierarchy') hierarchy: string,
    @Query('item_per_page') itemPerPage: number = 10,
    @Query('category_id') categoryId?: number,
    @Query('price-range') priceRange?: string,
    @Query('sort') sort?: string,
    @Query('search') search?: string,
  ) {
    if (Number(hierarchy) === 1) {
      return this.productService.getProductsByCategory(itemPerPage);
    } else {
      return this.productService.getProducts(
        page,
        featured,
        latest,
        itemPerPage,
        categoryId,
        priceRange,
        sort,
        search,
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
}
