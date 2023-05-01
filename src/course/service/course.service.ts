import { CreateCourseInput } from '@course/dto/create-course.input';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Course } from '@prisma/client';
import { Course as CourseModel } from '@course/model/course.model';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<CourseModel[]> {
    const findCourseList = await this.prisma.course.findMany({});
    const courseModelList: CourseModel[] = [];

    for (const findCourse of findCourseList) {
      const studentCount = await this.prisma.student.count({
        where: {
          courseId: findCourse.id,
        },
      });

      const examCount = await this.prisma.exam.count({
        where: {
          courseId: findCourse.id,
        },
      });

      courseModelList.push(
        this.addCountToCourse(findCourse, studentCount, examCount),
      );
    }

    return courseModelList;
  }

  addCountToCourse(course: Course, studentCount: number, examCount: number) {
    const courseModel = new CourseModel();

    courseModel.id = course.id.toString();
    courseModel.name = course.name;
    courseModel.createdAt = course.createdAt;
    courseModel.updatedAt = course.updatedAt;
    courseModel.studentCount = studentCount;
    courseModel.examCount = examCount;

    return courseModel;
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

  async update(payload: CreateCourseInput): Promise<Course> {
    await this.prisma.course.findMany({});

    const course = await this.prisma.course.update({
      where: {
        id: payload.id,
      },
      data: {
        name: payload.name,
      },
    });

    if (!course) {
      throw new NotFoundException('해당하는 분반이 존재하지 않습니다.');
    }

    return course;
  }

  async findOneById(courseId: number): Promise<Course> {
    const findCourse = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!findCourse) {
      throw new NotFoundException('분반 조회 중 오류가 발생했습니다.');
    }

    return findCourse;
  }

  async deleteById(courseId: number): Promise<void> {
    await this.prisma.course.delete({ where: { id: courseId } });
  }
}
