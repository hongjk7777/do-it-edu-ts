import { BaseModel } from '@common/model/base.model';
import { ExamStudentScore } from '@exam-student/model/exam-student-score.model';
import { Exam } from '@exam/model/exam.model';
import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import {
  Exam as ExamModel,
  ExamStudentScore as ExamStudentScoreModel,
} from '@prisma/client';
import { Student } from '@student/model/student.model';
import { StudentDeptRankingDto } from './student-dept-ranking.dto';

@ObjectType()
export class ExamStudentResponseDto {
  @Field(() => [ExamStudentScore])
  examStudentScoreList: ExamStudentScoreModel[];

  @Field(() => Exam)
  exam: ExamModel;

  @Field(() => String, { nullable: true })
  seoulDept: string;

  @Field(() => String, { nullable: true })
  yonseiDept: string;

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

  @Field(() => [StudentDeptRankingDto], { nullable: true })
  seoulDeptRankingList: StudentDeptRankingDto[];

  @Field(() => [StudentDeptRankingDto], { nullable: true })
  yonseiDeptRankingList: StudentDeptRankingDto[];

  constructor(
    examStudentScoreList: ExamStudentScoreModel[],
    exam: ExamModel,
    seoulDept: string,
    yonseiDept: string,
    studentAmount: number,
    average: number,
    stdDev: number,
    highestScore: number,
    ranking: number,
    rankingList: number[],
    subAberageList: number[],
    subHighestScoreList: number[],
    seoulDeptRankingList: StudentDeptRankingDto[],
    yonseiDeptRankingList: StudentDeptRankingDto[],
  ) {
    this.examStudentScoreList = examStudentScoreList;
    this.exam = exam;
    this.seoulDept = seoulDept;
    this.yonseiDept = yonseiDept;
    this.studentAmount = studentAmount;
    this.average = average;
    this.stdDev = stdDev;
    this.highestScore = highestScore;
    this.ranking = ranking;
    this.rankingList = rankingList;
    this.subAverageList = subAberageList;
    this.subHighestScoreList = subHighestScoreList;
    this.seoulDeptRankingList = seoulDeptRankingList;
    this.yonseiDeptRankingList = yonseiDeptRankingList;
  }
}
