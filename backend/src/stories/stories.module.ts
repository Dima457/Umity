import { Module } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { StoriesController } from './stories.controller';
import { PrismaService } from '../prisma/prisma.service'; // путь к твоему призма сервису

@Module({
  providers: [StoriesService, PrismaService],
  controllers: [StoriesController],
})
export class StoriesModule {}