import UserInfo from '@auth/dto/user-info.dto';
import { CurrentUser } from '@common/decorator/current-user.decorator';
import { BadRequestException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UpdateStudentInput } from '@student/dto/update-student.input';
import { CreateStudentInput } from '../dto/create-student.input';
import { Student } from '../model/student.model';
import { StudentService } from '../service/student.service';

@Resolver()
export class StudentResolver {
  constructor(private studentService: StudentService) {}

  @Mutation(() => Student)
  async createStudent(@Args('data') studentDatas: CreateStudentInput) {
    if (!studentDatas.phoneNum.startsWith('010')) {
      throw new BadRequestException('올바른 전화번호 양식이 아닙니다.');
    }
    return await this.studentService.save(studentDatas);
  }

  @Query(() => Student)
  async student(@Args('id') studentId: number) {
    return await this.studentService.findOneById(studentId);
  }

  @Mutation(() => Student)
  async updateStudent(@Args('data') studentDatas: UpdateStudentInput) {
    return await this.studentService.update(studentDatas);
  }

  @Query(() => Student)
  async getStudentByPhoneNum(@Args('phoneNum') phoneNum: string) {
    return await this.studentService.findOneByPhoneNum(phoneNum);
  }

  @Query(() => Student)
  async getStudentByUserId(@CurrentUser() user: UserInfo) {
    return await this.studentService.findOneByUserId(user.id);
  }

  @Query(() => [Student])
  async getStudentsByCourseId(@Args('courseId') courseId: number) {
    return await this.studentService.findAllByCourseId(courseId);
  }

  @Mutation(() => Boolean)
  async deleteStudent(@Args('id') studentId: number) {
    await this.studentService.deleteOneById(studentId);
    return true;
  }

  @Mutation(() => Boolean)
  async deleteStudentsByCourseId(@Args('id') courseId: number) {
    await this.studentService.deleteAllByCourseId(courseId);
    return true;
  }
}
