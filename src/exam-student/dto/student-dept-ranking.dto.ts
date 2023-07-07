import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Exam, Student } from '@prisma/client';

@ObjectType()
export class StudentDeptRankingDto {
  @Field(() => String)
  deptName: string;

  @Field(() => Int)
  rank: number;

  @Field(() => Int)
  studentAmount: number;

  @Field(() => [Int])
  rankingList: number[];

  constructor(
    deptName: string,
    rank: number,
    studentAmount: number,
    rankingList: number[],
  ) {
    this.deptName = deptName;
    this.rank = rank;
    this.studentAmount = studentAmount;
    this.rankingList = rankingList;
  }
}
