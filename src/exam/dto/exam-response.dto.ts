import { Exam } from '@exam/model/exam.model';
import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Exam as ExamModel } from '@prisma/client';

@ObjectType()
export class ExamResponseDto {
  @Field(() => Exam)
  exam: ExamModel;

  @Field(() => Int)
  studentAmount: number;

  @Field(() => Float)
  average: number;

  @Field(() => Float)
  highestScore: number;

  constructor(
    exam: ExamModel,
    studentAmount: number,
    average: number,
    highestScore: number,
  ) {
    this.exam = exam;
    this.studentAmount = studentAmount;
    this.average = average;
    this.highestScore = highestScore;
  }
}
