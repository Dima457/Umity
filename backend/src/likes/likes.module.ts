import { Module } from '@nestjs/common';
import { LikesController } from './likes.controller';
import { PrismaService } from '../prisma/prisma.service';
import { LikesService } from './likes.service';
@Module({
  controllers: [LikesController], 
  providers: [PrismaService,LikesService], 
})
export class LikesModul {}  