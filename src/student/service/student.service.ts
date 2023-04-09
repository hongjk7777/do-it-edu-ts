import { Injectable } from '@nestjs/common';
import { Student } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { CreateStudentInput } from '../dto/create-student.input';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  async save(studentDatas: CreateStudentInput): Promise<Student> {
    const findStudent = await this.prisma.student.findUnique({
      where: {
        phoneNum: studentDatas.phoneNum,
      },
    });

    if (findStudent) {
      throw Error('중복된 이메일입니다.');
    }

    const savedStudent = await this.prisma.student.create({
      data: {
        ...studentDatas,
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

    return findStudent;
  }

  async findOneByPhoneNum(phoneNum: string): Promise<Student> {
    const findStudent: Student = await this.prisma.student.findUnique({
      where: {
        phoneNum: phoneNum,
      },
    });

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
