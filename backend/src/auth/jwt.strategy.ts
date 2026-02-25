// *Импортируем необходимые классы из passport-jwt для работы с JWT
import { ExtractJwt, Strategy } from 'passport-jwt';

// *Импортируем PassportStrategy - базовый класс для стратегий Passport
import { PassportStrategy } from '@nestjs/passport';

// *Импортируем декораторы и исключения из NestJS
import { Injectable, UnauthorizedException } from '@nestjs/common';

// *Декоратор @Injectable позволяет NestJS управлять этим классом
// *как провайдером (сервисом) с dependency injection
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  
  // *Конструктор класса - вызывается при создании экземпляра
  constructor() {
    // *Получаем секретный ключ из переменных окружения
    const secret = process.env.JWT_SECRET;
    
    // *Проверяем, что секретный ключ установлен
    if (!secret) {
      // *Если ключ не найден, выбрасываем ошибку
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    // *Вызываем конструктор родительского класса PassportStrategy
    // *Передаем конфигурацию для JWT стратегии
    super({
      // *Указываем как извлекать JWT токен из запроса
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      
      // *Не игнорировать expiration date (срок действия токена)
      ignoreExpiration: false,
      
      // *Секретный ключ для верификации подписи токена
      secretOrKey: secret, // *Теперь точно строка (после проверки)
    });
  }

  // *Метод validate вызывается после успешной верификации JWT токена
  // *payload - расшифрованные данные из JWT токена
  async validate(payload: any) {
    // *Возвращаем объект с данными пользователя
    // *Эти данные будут доступны в req.user в контроллерах
    console.log('🔐 JWT payload:', payload);
   console.log('👤 UserId из токена:', payload.sub);
    return {
      userId: payload.sub,    // *sub (subject) обычно содержит ID пользователя
      email: payload.email,   // *Email пользователя из токена
      username: payload.username //* Имя пользователя из токена
    };
  }
}