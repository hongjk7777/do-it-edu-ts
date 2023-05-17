import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';

@InputType()
export class CreateExamInput {
  // @Field(() => Int)
  // @IsNotEmpty()
  // @Min(1)
  // round: number;

  @Field(() => Boolean)
  @IsNotEmpty()
  isCommonRound: boolean;

  @Field(() => Int)
  @IsNotEmpty()
  @Min(1)
  courseId: number;

  @Field(() => [Float])
  @IsOptional()
  maxScores: number[] = [0, 0, 0];
}
