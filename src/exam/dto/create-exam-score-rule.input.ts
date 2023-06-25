import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class CreateExamScoreRuleInput {
  constructor(problemNumber: number, scoreRule: string[]) {
    this.problemNumber = problemNumber;
    this.scoreRule = scoreRule;
  }

  @Field(() => Int)
  @IsNotEmpty()
  problemNumber: number;

  @Field(() => Int)
  @IsOptional()
  examId: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  round: number;

  @Field(() => Float)
  @IsOptional()
  highestScore: number;

  @Field(() => [String])
  scoreRule: string[];
}
