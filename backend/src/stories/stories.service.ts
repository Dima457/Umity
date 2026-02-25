import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoryDto } from './dto/crate-story.dto';

@Injectable()
export class StoriesService {
  private readonly logger = new Logger(StoriesService.name);

  constructor(private prisma: PrismaService) {
    this.logger.log('🚀 StoriesService инициализирован');
  }

  async create(userId: string, dto: CreateStoryDto) {
    const requestId = Math.random().toString(36).substring(7);
    
    this.logger.log(`📝 [${requestId}] Начало создания истории`);
    this.logger.debug(`[${requestId}] Входные параметры:`, {
      userId,
      dto: {
        image: dto.image,
        imageLength: dto.image?.length,
        imagePreview: dto.image?.substring(0, 50) + '...'
      }
    });

    try {
      // Проверка обязательных полей
      if (!userId) {
        this.logger.error(`[${requestId}] userId отсутствует`);
        throw new BadRequestException('User ID is required');
      }

      if (!dto?.image) {
        this.logger.error(`[${requestId}] image отсутствует в DTO`);
        throw new BadRequestException('Image URL is required');
      }

      // Валидация URL
      try {
        new URL(dto.image);
        this.logger.log(`[${requestId}] URL валидный: ${dto.image.substring(0, 50)}...`);
      } catch (urlError) {
        this.logger.error(`[${requestId}] Некорректный URL: ${dto.image}`, urlError);
        throw new BadRequestException('Invalid image URL format');
      }

      // Проверяем существование пользователя
      this.logger.log(`[${requestId}] Проверка существования пользователя: ${userId}`);
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true }
      });

      if (!userExists) {
        this.logger.error(`[${requestId}] Пользователь не найден: ${userId}`);
        throw new BadRequestException(`User with ID ${userId} not found`);
      }

      this.logger.log(`[${requestId}] Пользователь найден: ${userExists.username} (${userExists.id})`);

      // Проверяем лимит активных сторис
      this.logger.log(`[${requestId}] Проверка лимита активных сторис для пользователя ${userId}`);
      
      const now = new Date();
      this.logger.debug(`[${requestId}] Текущее время сервера: ${now.toISOString()}`);

      const activeCount = await this.prisma.story.count({
        where: {
          userId,
          expiresAt: { gt: now },
        },
      });

      this.logger.log(`[${requestId}] Найдено активных сторис: ${activeCount}`);

      if (activeCount >= 2) {
        this.logger.warn(`[${requestId}] Превышен лимит активных сторис: ${activeCount}/2`);
        
        // Для отладки получаем список активных сторис
        const activeStories = await this.prisma.story.findMany({
          where: {
            userId,
            expiresAt: { gt: now },
          },
          select: {
            id: true,
            image: true,
            createdAt: true,
            expiresAt: true,
          },
        });
        
        this.logger.debug(`[${requestId}] Активные сторис пользователя:`, activeStories);
        
        throw new BadRequestException('Maximum 2 active stories allowed');
      }

      // Рассчитываем время истечения
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      this.logger.log(`[${requestId}] Время создания: ${now.toISOString()}`);
      this.logger.log(`[${requestId}] Время истечения: ${expiresAt.toISOString()}`);
      this.logger.log(`[${requestId}] Длительность жизни: 24 часа`);

      // Создаем сторис
      this.logger.log(`[${requestId}] Создание записи в БД...`);
      
      const startTime = Date.now();
      const story = await this.prisma.story.create({
        data: {
          image: dto.image,
          userId,
          expiresAt,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });
      
      const duration = Date.now() - startTime;
      this.logger.log(`[${requestId}] Запись создана за ${duration}ms`);

      // Логируем результат
      this.logger.log(`[${requestId}] ✅ История успешно создана:`);
      this.logger.debug(`[${requestId}] Детали созданной истории:`, {
        id: story.id,
        image: story.image.substring(0, 50) + '...',
        userId: story.userId,
        username: story.user?.username,
        createdAt: story.createdAt,
        expiresAt: story.expiresAt,
      });

      // Проверяем, что история действительно активна
      const isActive = story.expiresAt > new Date();
      this.logger.log(`[${requestId}] Статус: ${isActive ? 'активна' : 'не активна'}`);

      return story;

    } catch (error) {
      this.logger.error(`[${requestId}] ❌ Ошибка при создании истории:`, {
        message: error.message,
        stack: error.stack,
        name: error.name,
        response: error.response,
        status: error.status,
      });

      // Если ошибка уже является HttpException, пробрасываем её дальше
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Логируем детали ошибки Prisma
      if (error.code) {
        this.logger.error(`[${requestId}] Код ошибки Prisma: ${error.code}`);
        this.logger.error(`[${requestId}] Meta Prisma:`, error.meta);
      }

      // Пробрасываем ошибку дальше
      throw error;
    }
  }

  async findAllActive() {
    const requestId = Math.random().toString(36).substring(7);
    
    this.logger.log(`🔍 [${requestId}] Поиск всех активных историй`);

    try {
      const now = new Date();
      this.logger.debug(`[${requestId}] Текущее время: ${now.toISOString()}`);

      const startTime = Date.now();
      const stories = await this.prisma.story.findMany({
        where: {
          expiresAt: { gt: now },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      const duration = Date.now() - startTime;
      
      this.logger.log(`[${requestId}] Найдено историй: ${stories.length} (за ${duration}ms)`);

      // Группируем по пользователям для статистики
      const storiesByUser = stories.reduce((acc, story) => {
        const username = story.user?.username || 'unknown';
        acc[username] = (acc[username] || 0) + 1;
        return acc;
      }, {});

      this.logger.debug(`[${requestId}] Статистика по пользователям:`, storiesByUser);

      if (stories.length > 0) {
        this.logger.debug(`[${requestId}] Первые 3 истории:`, stories.slice(0, 3).map(s => ({
          id: s.id,
          username: s.user?.username,
          createdAt: s.createdAt,
          expiresAt: s.expiresAt,
        })));
      }

      return stories;

    } catch (error) {
      this.logger.error(`[${requestId}] ❌ Ошибка при поиске активных историй:`, {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findByUser(userId: string) {
    const requestId = Math.random().toString(36).substring(7);
    
    this.logger.log(`👤 [${requestId}] Поиск историй пользователя: ${userId}`);

    try {
      if (!userId) {
        this.logger.error(`[${requestId}] userId не предоставлен`);
        throw new BadRequestException('User ID is required');
      }

      // Проверяем существование пользователя
      this.logger.log(`[${requestId}] Проверка существования пользователя...`);
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true }
      });

      if (!userExists) {
        this.logger.error(`[${requestId}] Пользователь не найден: ${userId}`);
        return []; // Возвращаем пустой массив, если пользователя нет
      }

      this.logger.log(`[${requestId}] Пользователь найден: ${userExists.username}`);

      const now = new Date();
      this.logger.debug(`[${requestId}] Текущее время: ${now.toISOString()}`);

      const startTime = Date.now();
      const stories = await this.prisma.story.findMany({
        where: {
          userId,
          expiresAt: { gt: now },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      
      const duration = Date.now() - startTime;

      this.logger.log(`[${requestId}] Найдено историй для пользователя ${userExists.username}: ${stories.length} (за ${duration}ms)`);

      if (stories.length > 0) {
        // Логируем детали каждой истории
        stories.forEach((story, index) => {
          this.logger.debug(`[${requestId}] История #${index + 1}:`, {
            id: story.id,
            image: story.image.substring(0, 30) + '...',
            createdAt: story.createdAt,
            expiresAt: story.expiresAt,
            timeLeft: Math.round((story.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)) + ' часов',
          });
        });

        // Проверяем порядок сортировки
        if (stories.length > 1) {
          const isSorted = stories.every((s, i) => 
            i === 0 || s.createdAt >= stories[i - 1].createdAt
          );
          this.logger.log(`[${requestId}] Порядок сортировки (по возрастанию): ${isSorted ? 'корректный' : 'нарушен'}`);
        }
      } else {
        this.logger.log(`[${requestId}] У пользователя нет активных историй`);
      }

      return stories;

    } catch (error) {
      this.logger.error(`[${requestId}] ❌ Ошибка при поиске историй пользователя ${userId}:`, {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  // Дополнительный метод для очистки просроченных историй (можно вызывать по крону)
  async cleanExpired() {
    const requestId = Math.random().toString(36).substring(7);
    
    this.logger.log(`🧹 [${requestId}] Запуск очистки просроченных историй`);

    try {
      const now = new Date();
      
      const startTime = Date.now();
      const result = await this.prisma.story.deleteMany({
        where: {
          expiresAt: { lt: now },
        },
      });
      
      const duration = Date.now() - startTime;

      this.logger.log(`[${requestId}] Удалено просроченных историй: ${result.count} (за ${duration}ms)`);

      if (result.count > 0) {
        this.logger.log(`[${requestId}] ✅ Очистка завершена успешно`);
      }

      return result;

    } catch (error) {
      this.logger.error(`[${requestId}] ❌ Ошибка при очистке просроченных историй:`, {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}