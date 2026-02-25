import {Controller, Post, Get, Body,Request, Param, Delete } from "@nestjs/common";
 import { PostService } from "./post.service";
 import { UseGuards } from "@nestjs/common";
 import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
 @Controller('posts')
 //@UseGuards(JwtAuthGuard)
 export class PostController{
    constructor(private postService:PostService){}

    @Post()
    @UseGuards(JwtAuthGuard)
    async createPost(@Body() data:any, @Request() req){
        console.log('🔐 Headers:', req.headers.authorization);
        console.log('👤 User object:', req.user);
        console.log('request user', req.user)
        return this.postService.createPost({
            ...data,
            authorID:req.user.userId, //*из jwt токена

        });
    }
    @Get('user/:userId')
    async getUserPosts(@Param('userId') userId:string){
        return this.postService.getUserPosts(userId);
    }
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async deletePost(@Param('id') id: string, @Request() req) {
        return this.postService.deletePost(id, req.user.userId);
}

@Get()
async getAllPosts(){
    return this.postService.getAllPosts();
    
}
 }