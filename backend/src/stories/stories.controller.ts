import { Controller, Get, Post, Body, Param, UseGuards, Request, Logger } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/crate-story.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('stories')
export class StoriesController {
    private readonly logger = new Logger(StoriesController.name);

    constructor(private storiesService: StoriesService){
        this.logger.log('🚀 StoriesController инициализирован');
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() dto: CreateStoryDto, @Request() req) {
        const requestId = Math.random().toString(36).substring(7);
        
        this.logger.log(`📝 [${requestId}] POST /stories - Создание новой истории`);
        this.logger.debug(`[${requestId}] Заголовки запроса:`, {
            authorization: req.headers.authorization ? 'Bearer [HIDDEN]' : 'отсутствует',
            userAgent: req.headers['user-agent'],
            ip: req.ip,
        });

        // Логируем информацию о пользователе из JWT
        this.logger.log(`[${requestId}] Информация из JWT:`, {
            userId: req.user?.userId,
            email: req.user?.email,
            username: req.user?.username,
            iat: req.user?.iat ? new Date(req.user.iat * 1000).toISOString() : undefined,
            exp: req.user?.exp ? new Date(req.user.exp * 1000).toISOString() : undefined,
        });

        // Логируем входящие данные
        this.logger.log(`[${requestId}] Получен DTO:`, {
            image: dto?.image ? `${dto.image.substring(0, 50)}...` : 'отсутствует',
            imageLength: dto?.image?.length || 0,
            hasImage: !!dto?.image,
        });

        // Проверка на наличие userId
        if (!req.user?.userId) {
            this.logger.error(`[${requestId}] userId отсутствует в JWT токене`);
            throw new Error('User ID not found in token');
        }

        try {
            this.logger.log(`[${requestId}] Вызов StoriesService.create для userId: ${req.user.userId}`);
            
            const startTime = Date.now();
            const result = await this.storiesService.create(req.user.userId, dto);
            const duration = Date.now() - startTime;

            this.logger.log(`[${requestId}] ✅ История успешно создана за ${duration}ms`);
            this.logger.debug(`[${requestId}] Результат:`, {
                id: result.id,
                userId: result.userId,
                image: result.image?.substring(0, 30) + '...',
                createdAt: result.createdAt,
                expiresAt: result.expiresAt,
            });

            return result;

        } catch (error) {
            this.logger.error(`[${requestId}] ❌ Ошибка при создании истории:`, {
                message: error.message,
                stack: error.stack,
                name: error.name,
                status: error.status,
                response: error.response,
            });
            throw error;
        }
    }

    @Get()
    async findAll() {
        const requestId = Math.random().toString(36).substring(7);
        
        this.logger.log(`🔍 [${requestId}] GET /stories - Запрос всех активных историй`);
        this.logger.log(`[${requestId}] Время запроса: ${new Date().toISOString()}`);

        try {
            const startTime = Date.now();
            const stories = await this.storiesService.findAllActive();
            const duration = Date.now() - startTime;

            this.logger.log(`[${requestId}] ✅ Найдено историй: ${stories.length} (за ${duration}ms)`);

            if (stories.length > 0) {
                // Группируем по пользователям для статистики
                const usersWithStories = new Set(stories.map(s => s.user?.username)).size;
                this.logger.log(`[${requestId}] Пользователей с историями: ${usersWithStories}`);

                // Логируем первые 5 историй
                this.logger.debug(`[${requestId}] Первые ${Math.min(5, stories.length)} историй:`, 
                    stories.slice(0, 5).map(s => ({
                        id: s.id,
                        username: s.user?.username,
                        createdAt: s.createdAt,
                        timeLeft: s.expiresAt ? Math.round((new Date(s.expiresAt).getTime() - Date.now()) / (1000 * 60)) + ' мин' : 'N/A',
                    }))
                );
            } else {
                this.logger.log(`[${requestId}] Активных историй не найдено`);
            }

            return stories;

        } catch (error) {
            this.logger.error(`[${requestId}] ❌ Ошибка при получении историй:`, {
                message: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    @Get('user/:userId')
    async findByUser(@Param('userId') userId: string) {
        const requestId = Math.random().toString(36).substring(7);
        
        this.logger.log(`👤 [${requestId}] GET /stories/user/${userId} - Запрос историй пользователя`);
        this.logger.log(`[${requestId}] Параметры запроса:`, {
            userId,
            userIdLength: userId?.length,
            timestamp: new Date().toISOString(),
        });

        // Валидация userId
        if (!userId) {
            this.logger.error(`[${requestId}] userId не предоставлен или пустой`);
            throw new Error('User ID is required');
        }

        if (typeof userId !== 'string') {
            this.logger.error(`[${requestId}] userId должен быть строкой, получен: ${typeof userId}`);
            throw new Error('Invalid user ID format');
        }

        try {
            this.logger.log(`[${requestId}] Вызов StoriesService.findByUser для userId: ${userId}`);
            
            const startTime = Date.now();
            const stories = await this.storiesService.findByUser(userId);
            const duration = Date.now() - startTime;

            this.logger.log(`[${requestId}] ✅ Найдено историй для пользователя ${userId}: ${stories.length} (за ${duration}ms)`);

            if (stories.length > 0) {
                // Проверяем, что все истории принадлежат запрошенному пользователю
                const allBelongToUser = stories.every(s => s.userId === userId);
                this.logger.log(`[${requestId}] Все истории принадлежат пользователю: ${allBelongToUser}`);

                // Детальная информация о каждой истории
                stories.forEach((story, index) => {
                    this.logger.debug(`[${requestId}] История #${index + 1}:`, {
                        id: story.id,
                        image: story.image?.substring(0, 30) + '...',
                        createdAt: story.createdAt,
                        expiresAt: story.expiresAt,
                        timeLeft: story.expiresAt ? 
                            Math.round((new Date(story.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)) + ' часов' : 
                            'N/A',
                        username: story.user?.username,
                    });
                });

                // Проверка на просроченные (на всякий случай)
                const now = new Date();
                const expiredCount = stories.filter(s => new Date(s.expiresAt) <= now).length;
                if (expiredCount > 0) {
                    this.logger.warn(`[${requestId}] Найдено ${expiredCount} просроченных историй!`);
                }

            } else {
                this.logger.log(`[${requestId}] У пользователя ${userId} нет активных историй`);
            }

            return stories;

        } catch (error) {
            this.logger.error(`[${requestId}] ❌ Ошибка при получении историй пользователя ${userId}:`, {
                message: error.message,
                stack: error.stack,
                name: error.name,
            });
            throw error;
        }
    }

    // Опционально: добавим эндпоинт для проверки работоспособности
    @Get('health')
    healthCheck() {
        const requestId = Math.random().toString(36).substring(7);
        this.logger.log(`💓 [${requestId}] GET /stories/health - Проверка работоспособности`);
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'stories',
            requestId,
        };
    }
}