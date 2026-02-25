// *Импортируем утилиты для тестирования из NestJS
import { Test, TestingModule } from '@nestjs/testing';

//* Импортируем тестируемый контроллер и сервис
import { AppController } from './app.controller';
import { AppService } from './app.service';

// *describe - функция Jest для группировки тестов
// *'AppController' - название тестовой группы
describe('AppController', () => {
  let appController: AppController; //* Переменная для хранения экземпляра контроллера

  //* beforeEach - выполняется перед каждым тестом
  //* async - потому что создание тестового модуля асинхронно
  beforeEach(async () => {
    //* Создаем тестовый модуль
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController], //* Регистрируем контроллер для тестирования
      providers: [AppService],      //* Регистрируем сервисы, которые использует контроллер
    }).compile(); // *Компилируем модуль

    // *Получаем экземпляр AppController из тестового модуля
    appController = app.get<AppController>(AppController);
  });

  //* Вложенная группа тестов для метода root
  describe('root', () => {
    // *it - отдельный тест кейс
    // *'should return "Hello World!"' - описание того, что должен делать тест
    it('should return "Hello World!"', () => {
      //* expect - утверждение (assertion)
      // *appController.getHello() - вызываем тестируемый метод
      //* .toBe('Hello World!') - проверяем, что результат равен ожидаемой строке
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
