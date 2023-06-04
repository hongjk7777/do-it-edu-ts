import { Module } from '@nestjs/common';
import { ExamStudentResolver } from './resolver/exam-student.resolver';
import { ExamStudentService } from './service/exam-student.service';
import { ExamExcelService } from './service/exam-excel.service';
import { ExamExcelResolver } from './resolver/exam-excel.resolver';

@Module({
  providers: [
    ExamStudentResolver,
    ExamExcelResolver,
    ExamStudentService,
    ExamExcelService,
  ],
})
export class ExamStudentModule {}
