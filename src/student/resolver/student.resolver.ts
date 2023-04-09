import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateStudentInput } from '../dto/create-student.input';
import { Student } from '../model/student.model';
import { StudentService } from '../service/student.service';

@Resolver()
export class StudentResolver {
  constructor(private studentService: StudentService) {}

  @Mutation(() => Student)
  async createStudent(@Args('data') studentDatas: CreateStudentInput) {
    return await this.studentService.save(studentDatas);
  }

  @Query(() => Student)
  async student(@Args('id') studentId: number) {
    return await this.studentService.findOneById(studentId);
  }

  @Query(() => Student)
  async getStudentByPhoneNum(@Args('phoneNum') phoneNum: string) {
    return await this.studentService.findOneByPhoneNum(phoneNum);
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
