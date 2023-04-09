import { Field, ID, ObjectType } from '@nestjs/graphql';
import { BaseModel } from 'src/common/model/base.model';
import { ExamStudentScore } from './exam-student-score.model';

@ObjectType()
export class ExamStudent extends BaseModel {
  @Field(() => ID)
  examId: number;

  @Field(() => ID)
  studentId: number;

  @Field()
  seoulDept?: string;

  @Field()
  yonseiDept?: string;

  @Field(() => [ExamStudentScore])
  examStudentScore: ExamStudentScore[];
}
