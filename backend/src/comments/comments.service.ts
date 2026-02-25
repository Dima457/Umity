// comments.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async getComments(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: { username: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createComment(postId: string, text: string, authorId: string) {
    // Проверяем существует ли пост
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    return this.prisma.comment.create({
      data: {
        text,
        postId,
        authorId,
      },
      include: {
        author: {
          select: { username: true, avatar: true }
        }
      }
    });
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== userId) throw new ForbiddenException('Not your comment');

    return this.prisma.comment.delete({
      where: { id: commentId }
    });
  }
}