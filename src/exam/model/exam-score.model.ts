import { BaseModel } from '@common/model/base.model';
import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ExamScore extends BaseModel {
  @Field(() => Int)
  problemNumber: number;

  @Field(() => Float)
  maxScore: number;
}
