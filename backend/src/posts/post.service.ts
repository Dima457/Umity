import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
@Injectable()
export class PostService{
    constructor(private prisma:PrismaService){}
    
    async createPost(data:{
        title?:string,
        content?:string,
        image?:string,
        authorID:string;
    }){
        return this.prisma.post.create({
            data:{
                title: data.title,
                content:data.content,
                image:data.image,
                authorID:data.authorID,
            },
        });
    }
    async getUserPosts(userId:string){
        return this.prisma.post.findMany({
            where:{authorID:userId},
            orderBy:{createdAt:'desc'},
            include:{
                author:{
                    select:{
                        id:true,
                        username:true,
                        avatar:true
                    },
                },
            },
        });
    }
    async likePost(postId:string,userId:string){
        //*здесь логика лайков
        }

    async deletePost(postId: string, userId: string) {
        const post = await this.prisma.post.findUnique({
         where: { id: postId }
            });

            if (!post) throw new NotFoundException('Post not found');
            if (post.authorID !== userId) throw new ForbiddenException('Not your post');

                return this.prisma.post.delete({
                     where: { id: postId }
             });
        }

        async getAllPosts(userId?: string) {
    const posts = await this.prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            },
            _count: {
                select: { likes: true }
            },
            // Условно добавляем likes только если есть userId
            ...(userId && {
                likes: {
                    where: { userId },
                    take: 1
                }
            })
        }
    });

    // Преобразуем в удобный формат для фронтенда
    return posts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        image: post.image,
        createdAt: post.createdAt,
        author: post.author,
        likesCount: post._count.likes,
        isLikedByMe: userId ? post.likes.length > 0 : false
    }));
}

}