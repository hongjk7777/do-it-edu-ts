import { ExamStudentModule } from '@exam-student/exam-student.module';
import { Module } from '@nestjs/common';
import { CourseResolver } from './resolver/course.resolver';
import { CourseService } from './service/course.service';

@Module({
  imports: [ExamStudentModule],
  providers: [CourseResolver, CourseService],
})
export class CourseModule {}
