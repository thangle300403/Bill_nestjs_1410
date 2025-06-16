import { Injectable } from '@nestjs/common';
import { Comment } from '../entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async getCommentsByProduct(productId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { product: { id: productId } },
      order: { created_date: 'DESC' },
    });
  }

  async createComment(
    productId: number,
    commentData: {
      email: string;
      fullname: string;
      rating: number;
      description: string;
    },
  ): Promise<{
    success: boolean;
    data: { comments: Comment[] };
  }> {
    const { email, fullname, rating, description } = commentData;
    const comment = this.commentRepository.create({
      product_id: productId,
      email,
      fullname,
      star: rating,
      created_date: new Date(), // Use current time
      description,
    });

    await this.commentRepository.save(comment);

    // Fetch updated comments
    const comments = await this.commentRepository.find({
      where: { product: { id: productId } },
      order: { created_date: 'DESC' },
    });

    return {
      success: true,
      data: { comments },
    };
  }
}
