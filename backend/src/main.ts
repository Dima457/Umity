//* Импортируем необходимые модули из NestJS
//* NestFactory - фабрика для создания NestJS приложения
//* AppModule - корневой модуль нашего приложения
import { NestFactory } from '@nestjs/core';
import { AppModule } from './apps/app.module';

//* Создаем асинхронную функцию bootstrap для запуска приложения
//* async/await позволяет работать с Promise в более читаемом стиле
async function bootstrap() {
  //* Создаем экземпляр приложения с помощью NestFactory
  //* AppModule - корневой модуль, который содержит всю структуру приложения
  const app = await NestFactory.create(AppModule);
  
  //* Включаем CORS (Cross-Origin Resource Sharing) для нашего приложения
  //* CORS позволяет браузеру разрешать запросы с других доменов/портов
  app.enableCors({
    origin: true,  // Разрешаем ВСЕ origin'ы
    credentials: true,  // Разрешаем куки/заголовки авторизации
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  //* Запускаем сервер на указанном порту
  //* process.env.PORT - получаем порт из переменных окружения, если не задан - используем 3001
  // ?? - оператор nullish coalescing (использует 3001 только если process.env.PORT null/undefined)
  await app.listen(process.env.PORT ?? 3001);
}

//* Вызываем функцию bootstrap для запуска приложения
bootstrap();