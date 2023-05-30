import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';

@InputType()
export class DeleteExamScoreRuleInput {
  @Field(() => Int)
  @IsNotEmpty()
  examId: number;

  @Field(() => Int)
  @IsNotEmpty()
  problemNumber: number;

  @Field(() => Int)
  @IsNotEmpty()
  subProblemNumber: number;
}
