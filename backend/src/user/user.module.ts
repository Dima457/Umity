// backend/src/user/user.module.ts
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [UserController], //* Добавляем контроллер пользователя
  providers: [UserService, PrismaService], // *Регистрируем сервисы
  exports: [UserService], //* Экспортируем UserService для использования в других модулях
})
export class UserModule {}