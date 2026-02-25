import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
@Injectable()
export class PostService{
    constructor(private prisma:PrismaService){}
    //*создание поста
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

        async getAllPosts(){
            return this.prisma.post.findMany({
                orderBy:{createdAt:'desc'},
                include:{
                    author:{
                        select:{
                            id:true,
                            username:true,
                            avatar:true,
                            bio:true
                        }
                    }
                }
            });
 
        }

}