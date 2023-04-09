import { Module } from '@nestjs/common';
import { ExamStudentResolver } from './resolver/exam-student.resolver';
import { ExamStudentService } from './service/exam-student.service';

@Module({
  providers: [ExamStudentResolver, ExamStudentService],
})
export class ExamStudentModule {}
