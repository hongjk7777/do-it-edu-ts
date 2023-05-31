import { BaseModel } from '@common/model/base.model';
import { ExamStudentScore } from '@exam-student/model/exam-student-score.model';
import { Exam } from '@exam/model/exam.model';
import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import {
  Exam as ExamModel,
  ExamStudentScore as ExamStudentScoreModel,
} from '@prisma/client';
import { Student } from '@student/model/student.model';

@ObjectType()
export class ExamStudentResponseDto {
  @Field(() => [ExamStudentScore])
  examStudentScoreList: ExamStudentScoreModel[];

  @Field(() => Exam)
  exam: ExamModel;

  @Field(() => Int)
  studentAmount: number;

  @Field(() => Float)
  average: number;

  @Field(() => Float)
  stdDev: number;

  @Field(() => Float)
  highestScore: number;

  @Field(() => Int)
  ranking: number;

  @Field(() => [Int])
  rankingList: number[];

  @Field(() => [Float])
  subAverageList: number[];

  @Field(() => [Float])
  subHighestScoreList: number[];

  constructor(
    examStudentScoreList: ExamStudentScoreModel[],
    exam: ExamModel,
    studentAmount: number,
    average: number,
    stdDev: number,
    highestScore: number,
    ranking: number,
    rankingList: number[],
    subAberageList: number[],
    subHighestScoreList: number[],
  ) {
    this.examStudentScoreList = examStudentScoreList;
    this.exam = exam;
    this.studentAmount = studentAmount;
    this.average = average;
    this.stdDev = stdDev;
    this.highestScore = highestScore;
    this.ranking = ranking;
    this.rankingList = rankingList;
    this.subAverageList = subAberageList;
    this.subHighestScoreList = subHighestScoreList;
  }
}
