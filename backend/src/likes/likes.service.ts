import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LikesService {
    constructor(private prisma: PrismaService){}

    async getLikesCount(postId:string){
        return this.prisma.like.count({where: { postId }} )
    }

    async isLikedByUser(postId: string, userId: string) {
    const like = await this.prisma.like.findFirst({
        where: {
           
           
                userId: userId,
                postId: postId
            
        }
    });
    
    return !!like; // Приводим к boolean: true если найден, false если null
}

async likePost(postId: string, userId: string){
       const post = await this.prisma.post.findUnique({ where: { id: postId } });
       if (!post) throw new NotFoundException('Post not found');
       if (!post) {
        throw new NotFoundException('Post not found');
    }
    // 2. Проверяем, не лайкнул ли уже (опционально, но лучше)
    const existingLike = await this.prisma.like.findFirst({
        where: { postId, userId }
    });
    if (existingLike) {
       return existingLike
    }

      return this.prisma.like.create({
        data: {
            postId: postId,
            userId: userId
        }
    });
}

async unlikePost(postId: string, userId: string){
    const ourLike = await this.prisma.like.findFirst({where:{postId,userId}})
    if (!ourLike) throw new NotFoundException('Like not found');
    
        return this.prisma.like.delete({
            where: { id:ourLike.id }
        })
    
    
    
}
}

