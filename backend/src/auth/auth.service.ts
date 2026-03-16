import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// *Импортируем bcrypt для хеширования паролей
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

// *Декоратор @Injectable отмечает класс как провайдер
@Injectable()
export class AuthService {
  // *Внедряем зависимости через конструктор
  constructor(
    private userService: UserService, // *Сервис для работы с пользователями
    private jwtService: JwtService,   // *Сервис для работы с JWT токенами
  ) {}

  // *Метод для валидации пользователя при логине
  //* Возвращает пользователя без пароля если credentials верные
  async validateUser(email: string, password: string): Promise<any> {
    // *Ищем пользователя по email в базе данных
    const user = await this.userService.findByEmail(email);
    // *Если пользователь найден и пароль совпадает
    if (user && await bcrypt.compare(password, user.password)) {
      // *Удаляем пароль из объекта пользователя (для безопасности)
      const { password, ...result } = user; // *destructuring assignment
      return result; // *Возвращаем пользователя без пароля
    }
    // *Если аутентификация не удалась
    return null;
  }

  // *Метод для входа пользователя (генерирует JWT токен)
  async login(user: any) {
    // *Создаем payload для JWT токена
    const payload = { 
      email: user.email,   // *Email пользователя
      sub: user.id,        // *subject (обычно содержит user ID)
      username: user.username // *Имя пользователя
    };
    
    // *Генерируем JWT токен с payload
    // *sign метод автоматически добавляет iat (issued at) и exp (expiration)
    return {
      access_token: this.jwtService.sign(payload), //* JWT токен
      user: { 
        id: user.id,
        email: user.email,
        username: user.username,
        bio: user.bio,
        avatar: user.avatar,
      },
    };
  }

  // *Метод для регистрации нового пользователя
  async register(userData: { 
    email: string; 
    password: string; 
    username: string; 
    bio?: string; // *опциональное поле
  }) {
    // *Хешируем пароль перед сохранением в базу (очень важно!)
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    // *Создаем пользователя в базе данных через UserService
    const user = await this.userService.create({
      ...userData,          // *spread operator - копируем все свойства
      password: hashedPassword, // *заменяем plain password на хешированный
    });
    
    // *После успешной регистрации автоматически логиним пользователя
    return this.login(user);
  }
}