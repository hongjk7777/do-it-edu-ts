import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';

@InputType()
export class UpdateExamScoreInput {
  @Field(() => Int)
  @IsNotEmpty()
  examId: number;

  @Field(() => [Float])
  @IsNotEmpty()
  scoreList: number[];
}
