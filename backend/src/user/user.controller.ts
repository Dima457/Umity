// *Импортируем необходимые декораторы и классы из NestJS
import { Controller, Get, UseGuards, Request, Patch, Body, Param } from '@nestjs/common';

//* Импортируем JwtAuthGuard - наш кастомный guard для аутентификации
//* Guard защищает роут от неавторизованного доступа
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

//* Импортируем UserService - наш сервис для работы с пользователями
import { UserService } from './user.service';

//* Декоратор @Controller отмечает класс как контроллер
//* 'user' означает, что все роуты будут начинаться с /user
@Controller('user')
export class UserController {
  
  //* Внедряем зависимость UserService через конструктор
  //* private userService: UserService - автоматическое создание свойства
  //* NestJS автоматически предоставит экземпляр UserService
  constructor(private userService: UserService) {}

  //* Декоратор @UseGuards применяет JwtAuthGuard к этому роуту
  //* JwtAuthGuard проверяет JWT токен перед выполнением метода
  @UseGuards(JwtAuthGuard)
  
  //* Декоратор @Get определяет GET endpoint
  //* 'profile' означает полный путь /user/profile
  @Get('profile')
  
  //* Метод getProfile - обрабатывает GET запросы к /user/profile
  //* @Request() req - декоратор для получения объекта запроса
  getProfile(@Request() req) {
    //* req.user содержит данные из JWT токена (после проверки в JwtAuthGuard)
    //* req.user.sub обычно содержит user ID (subject из JWT payload)
    console.log('userobject from jwt', req.user);
    //* Вызываем метод findById из UserService для получения данных пользователя
    return this.userService.findById(req.user.userId);
  }
  @Patch('profile')
@UseGuards(JwtAuthGuard)
async updateProfile(@Request() req, @Body() updateData: {bio?: string, avatar?: string}) {
    console.log('🎯 PATCH /user/profile HIT!');
    console.log('👤 User object:', req.user);
    console.log('📦 Update data:', updateData);
    
    if (!req.user?.userId) {
        console.error('❌ No user ID in request');
        throw new Error('User not authenticated');
    }
    
    try {
        const result = await this.userService.updateUser(req.user.userId, updateData);
        console.log('✅ Update successful:', result);
        return result;
    } catch (error) {
        console.error('❌ Update failed:', error);
        throw error;
    }
}
 @Get(':userId/profile')
async getPublicProfile(@Param('userId') userId: string) {
    return this.userService.getPublicProfile(userId);
}

}