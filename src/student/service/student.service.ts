import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Student } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { CreateStudentInput } from '../dto/create-student.input';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  async save(
    studentDatas: CreateStudentInput,
    userId: number,
  ): Promise<Student> {
    const findStudent = await this.prisma.student.findUnique({
      where: {
        phoneNum: studentDatas.phoneNum,
      },
    });

    if (findStudent) {
      throw new BadRequestException('동일한 학생이 존재합니다.');
    }

    const savedStudent = await this.prisma.student.create({
      data: {
        name: studentDatas.name,
        phoneNum: studentDatas.phoneNum,
        course: {
          connect: {
            id: studentDatas.courseId,
          },
        },
        school: studentDatas.school,
        // ...studentDatas,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return savedStudent;
  }

  async findAllByCourseId(courseId: number): Promise<Student[]> {
    const findStudentList: Student[] = await this.prisma.student.findMany({
      where: {
        courseId: courseId,
      },
    });

    return findStudentList;
  }

  async findOneById(studentId: number): Promise<Student> {
    const findStudent: Student = await this.prisma.student.findUnique({
      where: {
        id: studentId,
      },
    });

    if (!findStudent) {
      throw new NotFoundException('해당하는 학생이 없습니다.');
    }

    return findStudent;
  }

  async findOneByPhoneNum(phoneNum: string): Promise<Student> {
    const findStudent: Student = await this.prisma.student.findUnique({
      where: {
        phoneNum: phoneNum,
      },
    });

    if (!findStudent) {
      throw new NotFoundException('해당하는 학생이 없습니다.');
    }

    return findStudent;
  }

  async findOneByUserId(userId: number): Promise<Student> {
    const findStudent: Student = await this.prisma.student.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!findStudent) {
      throw new NotFoundException('해당하는 학생이 없습니다.');
    }

    return findStudent;
  }

  async deleteOneById(studentId: number): Promise<void> {
    await this.prisma.student.delete({
      where: { id: studentId },
    });
  }

  async deleteAllByCourseId(courseId: number): Promise<void> {
    await this.prisma.student.deleteMany({
      where: { courseId: courseId },
    });
  }
}
