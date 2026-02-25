/// backend/src/app.module.ts
import { Module } from '@nestjs/common'; // Исправлено: '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { PostModule } from 'src/posts/post.module';
import { PostController } from 'src/posts/post.controller';
import { CommentsController } from 'src/comments/comments.controller';
import { PostService } from 'src/posts/post.service';
import { CommentsService } from 'src/comments/comments.service';
import { PrismaService } from 'src/prisma/prisma.service'; // Правильный импорт
import { StoriesModule } from 'src/stories/stories.module';
import { StoriesController } from 'src/stories/stories.controller';
import { StoriesService } from 'src/stories/stories.service';
@Module({
  imports: [
    
    AuthModule,
    UserModule,
    PostModule, //* Добавляем UserModule в imports
    StoriesModule
  ],
   controllers: [PostController, CommentsController], // ← CommentsController должен быть тут
  providers: [PostService, CommentsService,PrismaService],
})
export class AppModule {} // Исправлено: правильный синтаксис класса