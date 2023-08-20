import { SignupInput } from '@auth/input/signup.input';
import { AuthService } from '@auth/service/auth.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Student, User } from '@prisma/client';
import { UpdateStudentInput } from '@student/dto/update-student.input';
import { PrismaService } from 'nestjs-prisma';
import { CreateStudentInput } from '../dto/create-student.input';

@Injectable()
export class StudentService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async save(studentDatas: CreateStudentInput): Promise<Student> {
    const findSameNameStudent = await this.prisma.student.findFirst({
      where: {
        courseId: studentDatas.courseId,
        name: studentDatas.name,
      },
    });

    if (findSameNameStudent) {
      throw new BadRequestException('동일한 학생이 존재합니다.');
    }

    const findStudent = await this.prisma.student.findUnique({
      where: {
        phoneNum: studentDatas.phoneNum,
      },
    });

    if (findStudent) {
      throw new BadRequestException('동일한 학생이 존재합니다.');
    }

    const user = await this.authService.signUpStudent(
      new SignupInput(studentDatas.phoneNum, ''),
    );

    const savedStudent = await this.saveStudent(studentDatas, user);

    return savedStudent;
  }

  async saveStudent(studentDatas: CreateStudentInput, user: User) {
    return await this.prisma.student.create({
      data: {
        name: studentDatas.name,
        phoneNum: studentDatas.phoneNum,
        course: {
          connect: {
            id: studentDatas.courseId,
          },
        },
        user: {
          connect: {
            id: user.id,
          },
        },
        school: studentDatas.school,
      },
    });
  }

  async update(studentDatas: UpdateStudentInput): Promise<Student> {
    const updateStudent = await this.prisma.student.update({
      where: {
        id: studentDatas.id,
      },
      data: {
        name: studentDatas.name,
        phoneNum: studentDatas.phoneNum,
        school: studentDatas.school,
        course: {
          connect: {
            id: studentDatas.courseId,
          },
        },
      },
    });

    if (!updateStudent) {
      throw new NotFoundException('해당하는 학생이 존재하지 않습니다.');
    }

    return updateStudent;
  }

  async findAllByCourseId(courseId: number): Promise<Student[]> {
    const findStudentList: Student[] = await this.prisma.student.findMany({
      where: {
        courseId: courseId,
      },
      orderBy: [
        {
          name: 'asc',
        },
      ],
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
      return null;
      // throw new NotFoundException('해당하는 학생이 없습니다.');
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

  async findOneByNameAndCourseId(
    name: string,
    courseId: number,
  ): Promise<Student> {
    const findStudent: Student = await this.prisma.student.findFirst({
      where: {
        name: name,
        courseId: courseId,
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
