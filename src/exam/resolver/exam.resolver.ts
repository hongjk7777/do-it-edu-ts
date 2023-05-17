import { Public } from '@common/decorator/public.decorator';
import { UpsertScoreRuleInput } from '@exam/dto/update-exam-info.input';
import { UpdateExamScoreInput } from '@exam/dto/update-exam-score.input';
import { ExamScoreRule } from '@exam/model/exam-score-rule.model';
import { ExamScore } from '@exam/model/exam-score.model';
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

  @Public()
  @Mutation(() => [ExamScoreRule])
  async upsertExamScoreRule(
    @Args('data') upsertScoreRuleInput: UpsertScoreRuleInput,
  ) {
    return await this.examService.upsertExamScoreRule(upsertScoreRuleInput);
  }

  @Public()
  @Mutation(() => [ExamScore])
  async updateExamScore(@Args('data') updateScoreInput: UpdateExamScoreInput) {
    return await this.examService.updateExamScore(updateScoreInput);
  }

  // @Query(() => [Exam])
  // async commonExams(@Args('commonRound') commonRound: number) {
  //   return await this.examService.findAllByCommonRound(commonRound);
  // }

  @Public()
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
