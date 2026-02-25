// comments.controller.ts
import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CommentsService } from './comments.service';

@Controller('posts/:postId/comments')
export class CommentsController { // ← исправил на CommentsController
    constructor(private commentsService: CommentsService) {}
    
    @Get()
    async getComments(@Param('postId') postId: string) { // ← исправил скобку
        return this.commentsService.getComments(postId);
    }
    
    @Post()
    @UseGuards(JwtAuthGuard)
    async createComment(
        @Param('postId') postId: string,
        @Body() body: { text: string },
        @Request() req // ← добавил скобку
    ) {
        return this.commentsService.createComment(postId, body.text, req.user.userId); // ← исправил параметры
    }
    
    @Delete(':commentId')
    @UseGuards(JwtAuthGuard)
    async deleteComment(
        @Param('commentId') commentId: string,
        @Request() req
    ) {
        return this.commentsService.deleteComment(commentId, req.user.userId);
    }
    @Get('test/:postId')
testEndpoint(@Param('postId') postId: string) {
    return { message: 'Comments controller works!', postId };
}
}