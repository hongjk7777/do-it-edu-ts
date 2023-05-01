import { CreateCourseInput } from '@course/dto/create-course.input';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Course } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Course[]> {
    const findCourseList = await this.prisma.course.findMany({});

    return findCourseList;
  }

  async save(payload: CreateCourseInput): Promise<Course> {
    const findCourse = await this.prisma.course.findUnique({
      where: {
        name: payload.name,
      },
    });

    if (findCourse) {
      throw new BadRequestException('중복되는 이름의 분반이 존재합니다.');
    }

    const course = await this.prisma.course.create({
      data: {
        ...payload,
      },
    });

    return course;
  }

  async findOneById(courseId: number): Promise<Course> {
    const findCourse = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (findCourse === null) {
      throw new BadRequestException('해당하는 학생이 존재하지 않습니다.');
    }

    return findCourse;
  }

  async deleteById(courseId: number): Promise<void> {
    await this.prisma.course.delete({ where: { id: courseId } });
  }
}
