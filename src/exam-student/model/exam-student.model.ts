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

  @Field(() => String, { nullable: true })
  seoulDept?: string;

  @Field(() => String, { nullable: true })
  yonseiDept?: string;

  @Field(() => [ExamStudentScore])
  examStudentScore: ExamStudentScore[];
}
