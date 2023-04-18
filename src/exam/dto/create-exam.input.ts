import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';

@InputType()
export class CreateExamInput {
  @Field(() => Int)
  @IsNotEmpty()
  @Min(1)
  round: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  commonRound?: number;

  @Field(() => Int)
  @IsNotEmpty()
  @Min(1)
  courseId: number;

  @Field()
  @IsNotEmpty()
  scoreRule: string;

  @Field(() => [Float])
  @IsNotEmpty()
  maxScores: number[];
}
