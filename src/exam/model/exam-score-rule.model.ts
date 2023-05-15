import { BaseModel } from '@common/model/base.model';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ExamScoreRule extends BaseModel {
  @Field(() => Int)
  problemNumber: number;

  @Field(() => String)
  scoreRule: string;
}
