import { Field, Float, ObjectType } from '@nestjs/graphql';
import { BaseModel } from 'src/common/model/base.model';

@ObjectType()
export class ExamStudentScore extends BaseModel {
  @Field(() => Float)
  problemNumber: number;

  @Field(() => Float)
  problemScore: number;
}
