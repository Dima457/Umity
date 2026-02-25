//* Импортируем необходимые декораторы и интерфейсы из NestJS
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";

//* Импортируем PrismaClient из пакета @prisma/client
//* PrismaClient - это основной класс для работы с базой данных
import { PrismaClient } from '@prisma/client';

// *Декоратор @Injectable отмечает класс как провайдер
// *Это позволяет NestJS управлять его жизненным циклом и внедрять зависимости
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  
  
  // *Метод onModuleInit вызывается автоматически при инициализации модуля
  // *OnModuleInit - интерфейс жизненного цикла NestJS
  async onModuleInit() {
    // *Устанавливаем соединение с базой данных
    await this.$connect();
  }

  //* Метод onModuleDestroy вызывается автоматически при уничтожении модуля
  // *OnModuleDestroy - интерфейс жизненного цикла NestJS  
  async onModuleDestroy() {
    // *Закрываем соединение с базой данных
    await this.$disconnect();
  }
}