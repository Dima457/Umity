// *Импортируем необходимые декораторы и классы из NestJS
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';

// *Импортируем наш сервис аутентификации
import { AuthService } from './auth.service';

// *Декоратор @Controller определяет класс как контроллер
// *'auth' означает, что все роуты будут начинаться с /auth
@Controller('auth')
export class AuthController {
  
  //* Внедряем зависимость AuthService через конструктор
  // *private authService: AuthService - автоматическое создание свойства
  //* NestJS автоматически предоставит экземпляр AuthService
  constructor(private authService: AuthService) {}

  // *Декоратор @Post определяет POST endpoint
  // *'login' означает полный путь /auth/login
  @Post('login')
  
  // *Метод login - обрабатывает POST запросы к /auth/login
  //* @Body() body - декоратор для извлечения данных из тела запроса
  async login(@Body() body: { email: string; password: string }) {
    // *Вызываем метод validateUser из AuthService для проверки учетных данных
    const user = await this.authService.validateUser(body.email, body.password);
    
    // *Если пользователь не найден или пароль неверный
    if (!user) {
      //* Выбрасываем исключение UnauthorizedException (HTTP 401)
      throw new UnauthorizedException('Invalid credentials');
    }

    // *Если аутентификация успешна, вызываем метод login для генерации JWT токена
    return this.authService.login(user);
  }

  //* Декоратор @Post для endpoint /auth/register
  @Post('register')
  
  //* Метод register - обрабатывает регистрацию новых пользователей
  async register(@Body() body: { 
    email: string; 
    password: string; 
    username: string; 
    bio?: string; // ? означает опциональное поле
  }) {
    // *Вызываем метод register из AuthService
    //* AuthService сам позаботится о хешировании пароля и создании пользователя
    return this.authService.register(body);
  }
}