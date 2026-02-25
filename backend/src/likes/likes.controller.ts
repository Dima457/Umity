import { Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LikesService } from './likes.service';

@Controller('posts/:postId/likes')
export class LikesController {
    constructor(private likesService: LikesService) {}

    // POST /posts/:postId/like - поставить лайк
    @Post()
    @UseGuards(JwtAuthGuard)
    async likePost(
        @Param('postId') postId: string,
        @Request() req
    ) {
        return this.likesService.likePost(postId, req.user.userId);
    }

    // DELETE /posts/:postId/like - убрать лайк
    @Delete()
    @UseGuards(JwtAuthGuard)
    async unlikePost(
        @Param('postId') postId: string,
        @Request() req
    ) {
        return this.likesService.unlikePost(postId, req.user.userId);
    }

    // GET /posts/:postId/likes - количество лайков
    @Get()
    async getLikesCount(@Param('postId') postId: string) {
        return this.likesService.getLikesCount(postId);
    }
}