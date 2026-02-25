// *Импортируем декоратор Injectable из NestJS
// *@Injectable позволяет NestJS управлять этим классом через Dependency Injection
import { Injectable } from '@nestjs/common';

// *Декоратор @Injectable отмечает класс как провайдер (сервис)
// *Теперь AppService может быть внедрен в другие классы через конструктор
@Injectable()
export class AppService {
  
  // *Метод getHello возвращает строку 'Hello World!'
  //* : string - TypeScript аннотация типа, указывающая что возвращается строка
  getHello(): string {
    return 'Hello World!';
  }
}
