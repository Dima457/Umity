// backend/src/user/user.module.ts
import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PrismaService } from '../prisma/prisma.service';
 
@Module({
  controllers: [PostController], //* Добавляем контроллер пользователя
  providers: [PostService, PrismaService], //* Регистрируем сервисы
  exports: [PostService], //* Экспортируем PostService для использования в других модулях
})
export class PostModule {}