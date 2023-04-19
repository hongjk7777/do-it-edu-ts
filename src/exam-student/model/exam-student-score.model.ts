import { BaseModel } from '@common/model/base.model';
import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ExamStudentScore extends BaseModel {
  @Field(() => Float)
  problemNumber: number;

  @Field(() => Float)
  problemScore: number;
}
