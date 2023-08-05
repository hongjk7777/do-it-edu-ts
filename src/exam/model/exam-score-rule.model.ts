import { BaseModel } from '@common/model/base.model';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@ObjectType()
export class ExamScoreRule extends BaseModel {
  @Field(() => Int, { nullable: true })
  round?: number;

  @Field(() => Int)
  problemNumber: number;

  @Field(() => Int)
  subProblemNumber: number;

  @Field(() => String)
  scoreRule: string;

  @Field(() => Int)
  @IsOptional()
  maxScore: number;
}
