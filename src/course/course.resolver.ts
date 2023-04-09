import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CourseService } from './course.service';
import { CreateCourseInput } from './dto/create-course.input';
import { Course } from './model/course.model';

@Resolver()
export class CourseResolver {
  constructor(private courseService: CourseService) {}

  @Query(() => [Course])
  async courses() {
    return await this.courseService.findAll();
  }

  @Mutation(() => Course)
  async createCourse(@Args('data') data: CreateCourseInput) {
    return this.courseService.save(data);
  }

  @Query(() => Course)
  async course(@Args('id') courseId: number) {
    return await this.courseService.findOneById(courseId);
  }

  @Mutation(() => Boolean)
  async deleteCourse(@Args('id') courseId: number) {
    await this.courseService.deleteById(courseId);
    return true;
  }
}
