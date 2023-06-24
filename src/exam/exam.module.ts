import { Module } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { ExamResolver } from './resolver/exam.resolver';
import { ExamService } from './service/exam.service';

@Module({
  providers: [ExamService, ExamResolver, PrismaService],
  exports: [ExamService],
})
export class ExamModule {}
