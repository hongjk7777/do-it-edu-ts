import { BaseModel } from '@common/model/base.model';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ExamStudentScore } from './exam-student-score.model';

@ObjectType()
export class ExamStudent extends BaseModel {
  @Field(() => ID)
  examId: number;

  @Field(() => ID)
  studentId: number;

  @Field(() => String)
  name: string;

  @Field(() => String)
  phoneNum: string;

  @Field()
  seoulDept?: string;

  @Field()
  yonseiDept?: string;

  @Field(() => [ExamStudentScore])
  examStudentScore: ExamStudentScore[];
}
