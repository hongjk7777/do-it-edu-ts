import { Injectable } from '@nestjs/common';
import { Course } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { CreateCourseInput } from './dto/create-course.input';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Course[]> {
    const findCourseList = await this.prisma.course.findMany({});

    return findCourseList;
  }

  async save(payload: CreateCourseInput): Promise<Course> {
    const course = await this.prisma.course.create({
      data: {
        ...payload,
      },
    });
    console.log(course);

    return course;
  }

  async findOneById(courseId: number): Promise<Course> {
    const findCourseList = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    return findCourseList;
  }

  async deleteById(courseId: number): Promise<void> {
    await this.prisma.course.delete({ where: { id: courseId } });
  }
}
