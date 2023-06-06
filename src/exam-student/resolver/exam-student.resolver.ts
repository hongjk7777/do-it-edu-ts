import { ExamStudentResponseDto } from '@exam-student/dto/exam-student-response.dto';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateExamStudentInput } from '../dto/create-exam-student.input';
import { ExamStudent } from '../model/exam-student.model';
import { ExamStudentService } from '../service/exam-student.service';

@Resolver(() => ExamStudent)
export class ExamStudentResolver {
  constructor(private examStudentService: ExamStudentService) {}

  @Query(() => ExamStudent)
  async examStudent(
    @Args('examId') examId: number,
    @Args('studentId') studentId: number,
  ) {
    return await this.examStudentService.findOneByExamIdAndStudentId(
      examId,
      studentId,
    );
  }

  @Query(() => [ExamStudentResponseDto])
  async getStudentExamsByStudentId(@Args('studentId') studentId: number) {
    return await this.examStudentService.findAllByStudentId(studentId);
  }

  @Query(() => [ExamStudent])
  async getStudentExamsByExamId(@Args('examId') examId: number) {
    return await this.examStudentService.findAllByExamId(examId);
  }

  @Query(() => [ExamStudent])
  async getStudentExamsBySeoulDept(@Args('seoulDept') seoulDept: string) {
    return await this.examStudentService.findAllBySeoulDept(seoulDept);
  }

  @Query(() => [ExamStudent])
  async getStudentExamsByYonseiDept(@Args('yonseiDept') yonseiDept: string) {
    return await this.examStudentService.findAllByYonseiDept(yonseiDept);
  }

  @Mutation(() => ExamStudent)
  async createExamStudent(
    @Args('data') examStudentDatas: CreateExamStudentInput,
  ) {
    return await this.examStudentService.saveWithScore(examStudentDatas);
  }

  @Mutation(() => Boolean)
  async deleteExamStudent(@Args('id') id: number) {
    await this.examStudentService.delete(id);
    return true;
  }

  @Mutation(() => Boolean)
  async deleteExamsStudentByExamId(@Args('examId') examId: number) {
    await this.examStudentService.deleteAllByExamId(examId);
    return true;
  }
}
