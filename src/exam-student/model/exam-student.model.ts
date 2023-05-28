import { BaseModel } from '@common/model/base.model';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Student } from '@student/model/student.model';
import { ExamStudentScore } from './exam-student-score.model';

@ObjectType()
export class ExamStudent extends BaseModel {
  @Field(() => ID)
  examId: number;

  @Field(() => ID)
  studentId: number;

  @Field(() => Student)
  student: Student;

  @Field()
  seoulDept?: string;

  @Field()
  yonseiDept?: string;

  @Field(() => [ExamStudentScore])
  examStudentScore: ExamStudentScore[];
}
