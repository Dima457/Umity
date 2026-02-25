//* Импортируем необходимые декораторы из NestJS
import { Controller, Get } from '@nestjs/common';

// *Импортируем AppService - сервис, который содержит бизнес-логику
import { AppService } from './app.service';

//* Декоратор @Controller отмечает класс как контроллер
//* Пустые скобки () означают, что роуты будут на корневом пути /
@Controller()
export class AppController {
  
  //* Конструктор класса - внедряем зависимость AppService
  //* private readonly appService: AppService - создает свойство класса
  //* readonly означает, что ссылка не может быть изменена после инициализации
  constructor(private readonly appService: AppService) {}

  //* Декоратор @Get определяет GET endpoint
  //* Пустые скобки () означают корневой путь: GET /
  @Get()
  
  // *Метод getHello - обрабатывает GET запросы к корневому пути
  // *: string - TypeScript аннотация типа возвращаемого значения
  getHello(): string {
    //* Вызываем метод getHello из AppService и возвращаем результат
    return this.appService.getHello();
  }
}