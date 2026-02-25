// backend/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module'; 
import { JwtStrategy } from './jwt.strategy';// *Импортируем UserModule

@Module({
  imports: [
    // *Модуль JWT для работы с токенами
    JwtModule.register({
      secret: process.env.JWT_SECRET, // *Секретный ключ из переменных окружения
      signOptions: { expiresIn: '24h' }, // *Время жизни токена - 24 часа
    }),
    // *Добавляем UserModule в imports - теперь AuthModule имеет доступ 
    // *ко всем экспортируемым сервисам из UserModule (UserService)
    UserModule,
  ],
  controllers: [AuthController], // *Контроллер обработки запросов аутентификации
  providers: [AuthService,JwtStrategy], // *Сервис аутентификации (логика входа/регистрации)
  // *Убираем UserService и PrismaService отсюда - они теперь предоставляются 
  // *через UserModule, что следует принципу инкапсуляции модулей NestJS
  // *Это улучшает архитектуру и избегает циклических зависимостей
})
export class AuthModule {}