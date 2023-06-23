import { CreateExamScoreRuleInput } from '@exam/dto/create-exam-score-rule.input';
import { DeleteExamScoreRuleInput } from '@exam/dto/delete-exam-score-rule.input';
import { ExamScoreRule } from '@exam/model/exam-score-rule.model';
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

  @Query(() => [ExamScoreRule])
  async commonExamScoreRuleRounds() {
    return await this.examService.findAllCommonExamScoreRule();
  }

  @Query(() => [ExamScoreRule])
  async commonExamScoreRule(@Args('round') round: number) {
    return await this.examService.findCommonExamScoreRuleByRound(round);
  }

  // @Query(() => [Exam])
  // async commonExams(@Args('commonRound') commonRound: number) {
  //   return await this.examService.findAllByCommonRound(commonRound);
  // }

  @Mutation(() => Exam)
  async createExam(@Args('data') data: CreateExamInput) {
    return await this.examService.saveExamDatas(data);
  }

  @Mutation(() => Boolean)
  async deleteExams(@Args('courseId') courseId: number) {
    await this.examService.deleteAllByCourseId(courseId);

    return true;
  }

  @Mutation(() => [ExamScoreRule])
  async upsertExamScoreRule(@Args('data') data: CreateExamScoreRuleInput) {
    return await this.examService.upsertExamScoreRule(data.examId, data);
  }

  @Mutation(() => [ExamScoreRule])
  async upsertCommonExamScoreRule(
    @Args('data') data: CreateExamScoreRuleInput,
  ) {
    return await this.examService.upsertCommonExamScoreRule(data.round, data);
  }

  @Mutation(() => [Boolean])
  async deleteExamScoreRule(@Args('data') data: DeleteExamScoreRuleInput) {
    return await this.examService.deleteExamScoreRule(data);
  }
}
