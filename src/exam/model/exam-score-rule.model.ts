import { BaseModel } from '@common/model/base.model';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ExamScoreRule extends BaseModel {
  @Field(() => Int, { nullable: true })
  round?: number;

  @Field(() => Int)
  problemNumber: number;

  @Field(() => Int)
  subProblemNumber: number;

  @Field(() => String)
  scoreRule: string;
}
