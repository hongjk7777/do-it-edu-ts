import { Module } from '@nestjs/common';
import { CourseResolver } from './resolver/course.resolver';
import { CourseService } from './service/course.service';

@Module({
  providers: [CourseResolver, CourseService],
})
export class CourseModule {}
