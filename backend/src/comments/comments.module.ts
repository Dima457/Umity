// backend/src/user/user.module.ts
import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { PrismaService } from '../prisma/prisma.service';
 
@Module({
  controllers: [CommentsController], //* Добавляем контроллер пользователя
  providers: [CommentsService, PrismaService], //* Регистрируем сервисы
  exports: [CommentsService], //* Экспортируем PostService для использования в других модулях
})
export class CommentModule {}