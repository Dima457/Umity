//* Импортируем декоратор Injectable из NestJS
//* Injectable позволяет классу быть внедряемым зависимостью (Dependency Injection)
import { Injectable } from "@nestjs/common";

//* Импортируем наш сервис для работы с Prisma ORM
// *PrismaService предоставляет доступ к базе данных
import { PrismaService } from "src/prisma/prisma.service";

// *Декоратор @Injectable отмечает класс как провайдер (сервис)
// *Теперь NestJS сможет управлять его зависимостями и внедрять их
@Injectable()
export class UserService {
  
  // *Конструктор класса - внедряем зависимость PrismaService
  // *private prisma: PrismaService - автоматическое создание свойства класса
  // *Dependency Injection: NestJS автоматически предоставит экземпляр PrismaService
  constructor(private prisma: PrismaService) {}

  // *Метод для поиска пользователя по ID
  // *async указывает, что метод возвращает Promise
  async findById(id: string) {
    // *Используем Prisma Client для запроса к базе данных
    return this.prisma.user.findUnique({
      where: { id }, // *Условие поиска: где id равен переданному значению
      select: {      // *Выбираем только определенные поля (исключаем пароль)
        id: true,
        email: true,
        username: true,
        bio: true,
        avatar: true,
        createAt: true,
        // *НЕТ password: true - важно для безопасности!
      },
    });
  }

  // *Метод для поиска пользователя по email
  // *Используется при аутентификации (логине)
  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email }, // *Поиск по email
      // *НЕТ select - получаем ВСЕ поля, включая password для проверки
    });
  }

  // *Метод для создания нового пользователя
  // *Принимает объект с данными пользователя
  async create(userData: { 
    email: string; 
    password: string; 
    username: string; 
    bio?: string; // ? означает опциональное поле
  }) {
    return this.prisma.user.create({
      data: userData, // *Данные для создания нового пользователя
      select: {       // *Возвращаем только определенные поля (без password)
        id: true,
        email: true,
        username: true, // *Добавлено username в select
        bio: true,
        avatar: true,
        createAt: true,
      },
    });
  }

  async updateUser(userId: string, data: {bio?: string, avatar?: string}) {
    console.log('🔄 updateUser called with:', { userId, data });
    
    // ПРОСТАЯ версия без фильтрации - для теста
    const updateData: any = {};
    
    if (data.bio !== undefined) {
        updateData.bio = data.bio;
    }
    if (data.avatar !== undefined) {
        updateData.avatar = data.avatar;
    }
    
    console.log('📝 Update data prepared:', updateData);
    
    // Если ничего не передали - возвращаем текущего пользователя
    if (Object.keys(updateData).length === 0) {
        console.log('ℹ️ No data to update, returning current user');
        return this.findById(userId);
    }
    
    try {
        const result = await this.prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                username: true,
                bio: true,
                avatar: true,
                createAt: true
            },
        });
        console.log('✅ Database update successful:', result);
        return result;
    } catch (error) {
        console.error('❌ Database error:', error);
        throw error;
    }
}
async getPublicProfile(userId: string) {
    return this.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            bio: true,
            avatar: true,
            createAt: true
        }
    });
}
}
