import { BaseModel } from '@common/model/base.model';
import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ExamStudentScore extends BaseModel {
  @Field(() => Int)
  examStudentId: number;

  @Field(() => Float)
  problemNumber: number;

  @Field(() => Float)
  problemScore: number;
}
