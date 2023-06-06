import { Module } from '@nestjs/common';
import { ExamResolver } from './resolver/exam.resolver';
import { ExamService } from './service/exam.service';

@Module({
  providers: [ExamService, ExamResolver],
  exports: [ExamService],
})
export class ExamModule {}
