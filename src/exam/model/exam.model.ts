import { BaseModel } from '@common/model/base.model';
import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { ExamScoreRule } from './exam-score-rule.model';
import { ExamScore } from './exam-score.model';

@ObjectType()
export class Exam extends BaseModel {
  @Field(() => Int)
  round: number;

  @Field(() => Int, { nullable: true })
  commonRound: number;

  @Field(() => Int)
  courseId: number;

  @Field(() => Float)
  average: number;

  @Field(() => Float)
  standardDeviation: number;

  // @Field(() => [ExamScoreRule])
  // scoreRule: ExamScoreRule[];

  @Field(() => Float)
  topScore: number;

  @Field(() => Int)
  totalTester: number;

  @Field(() => [ExamScore])
  examScore: ExamScore[];
}
