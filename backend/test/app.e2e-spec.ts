// * Test, TestingModule - утилиты для создания тестового модуля
import { Test, TestingModule } from '@nestjs/testing';

// * INestApplication - интерфейс Nest приложения
import { INestApplication } from '@nestjs/common';

// * request - библиотека для HTTP тестирования (аналогично axios/fetch)
import * as request from 'supertest';

// * App - тип приложения (может быть специфичным для фреймворка)
import { App } from 'supertest/types';

// * AppModule - корневой модуль приложения
import { AppModule } from '../src/apps/app.module';

// * describe() - группирует связанные тесты
// * 'AppController (e2e)' - название тестовой группы
describe('AppController (e2e)', () => {
  let app: INestApplication<App>; // * Переменная для экземпляра приложения

  // * beforeEach - выполняется перед каждым тестом
  beforeEach(async () => {
    // * Test.createTestingModule() - создает тестовый модуль
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // * Импортируем реальный AppModule
    }).compile(); // * Компилируем модуль

    // * Создаем экземпляр Nest приложения
    app = moduleFixture.createNestApplication();
    
    // * Инициализируем приложение (запускаем все хуки)
    await app.init();
  });

  // * it() - отдельный тест кейс
  // * '/ (GET)' - описание теста (путь и метод)
  it('/ (GET)', () => {
    // * request() - создает HTTP запрос к тестовому серверу
    return request(app.getHttpServer()) // * app.getHttpServer() - получаем HTTP сервер
      .get('/')           // * HTTP GET запрос к корневому пути
      .expect(200)        // * Проверяем статус код 200 (OK)
      .expect('Hello World!'); // * Проверяем тело ответа
  });
});