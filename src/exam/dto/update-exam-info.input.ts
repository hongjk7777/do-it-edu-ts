import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';

@InputType()
export class UpsertScoreRuleInput {
  @Field(() => Int)
  @IsNotEmpty()
  examId: number;

  @Field(() => Int)
  @IsNotEmpty()
  problemNumber: number;

  @Field(() => [String])
  @IsOptional()
  scoreRuleList: string[] = ['', '', ''];
}
