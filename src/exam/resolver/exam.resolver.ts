import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateExamInput } from '../dto/create-exam.input';
import { Exam } from '../model/exam.model';
import { ExamService } from '../service/exam.service';

@Resolver()
export class ExamResolver {
  constructor(private examService: ExamService) {}

  @Query(() => Exam)
  async exam(@Args('round') round: number, @Args('courseId') courseId: number) {
    return await this.examService.findByRoundAndCourseId(round, courseId);
  }

  @Query(() => [Exam])
  async exams(@Args('courseId') courseId: number) {
    return await this.examService.findAllByCourseId(courseId);
  }

  @Query(() => [Exam])
  async commonExams() {
    return await this.examService.findAllCommonExams();
  }

  // @Query(() => [Exam])
  // async commonExams(@Args('commonRound') commonRound: number) {
  //   return await this.examService.findAllByCommonRound(commonRound);
  // }

  @Mutation(() => Exam)
  async createExam(@Args('data') data: CreateExamInput) {
    return await this.examService.save(data);
  }

  @Mutation(() => Boolean)
  async deleteExams(@Args('courseId') courseId: number) {
    await this.examService.deleteAllByCourseId(courseId);

    return true;
  }
}
