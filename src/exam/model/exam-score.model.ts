import { Field, Int, ObjectType } from '@nestjs/graphql';
import { BaseModel } from 'src/common/model/base.model';

@ObjectType()
export class ExamScore extends BaseModel {
  @Field(() => Int)
  problemNumber: number;

  @Field(() => Int)
  maxScore: number;
}
