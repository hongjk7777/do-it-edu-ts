import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class CreateExamStudentInput {
  @Field(() => Int)
  @IsNotEmpty()
  examId: number;

  @Field(() => Int)
  @IsNotEmpty()
  studnetId: number;

  @Field()
  @IsOptional()
  seoulDept?: string;

  @Field()
  @IsOptional()
  yonseiDept?: string;

  @Field(() => [Float])
  @IsNotEmpty()
  scores: number[];
}
