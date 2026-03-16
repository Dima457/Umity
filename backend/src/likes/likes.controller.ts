import { Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LikesService } from './likes.service';

@Controller() 
 
export class LikesController {
    constructor(private likesService: LikesService) {}

    // POST /posts/:postId/likes
    @Post('posts/:postId/likes')
    @UseGuards(JwtAuthGuard)
    async likePost(
        @Param('postId') postId: string,
        @Request() req
    ) {
        return this.likesService.likePost(postId, req.user.userId);
    }

    // DELETE /posts/:postId/likes
    @Delete('posts/:postId/likes')
    @UseGuards(JwtAuthGuard)
    async unlikePost(
        @Param('postId') postId: string,
        @Request() req
    ) {
        return this.likesService.unlikePost(postId, req.user.userId);
    }

    // GET /posts/:postId/likes
    @Get('posts/:postId/likes')
    async getLikesCount(@Param('postId') postId: string) {
        return this.likesService.getLikesCount(postId);
    }

    // POST /comments/:commentId/likes
    @Post('comments/:commentId/likes')
    @UseGuards(JwtAuthGuard)
    async likeComment(
        @Param('commentId') commentId: string,
        @Request() req
    ) {
        return this.likesService.likeComment(commentId, req.user.userId); 
    }

    // DELETE /comments/:commentId/likes
    @Delete('comments/:commentId/likes') 
    @UseGuards(JwtAuthGuard)
    async unlikeComment(
        @Param('commentId') commentId: string,
        @Request() req
    ) {
        return this.likesService.unLikeComment(commentId, req.user.userId); 
    }

    // GET /comments/:commentId/likes
    @Get('comments/:commentId/likes') 
    async getCommentLikesCount(@Param('commentId') commentId: string) {
        return this.likesService.getLikeCommentCount(commentId);
    }
}
