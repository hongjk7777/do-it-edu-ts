import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, MinLength } from 'class-validator';

@InputType()
export class UpdateStudentInput {
  @Field()
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @Field()
  @IsNotEmpty()
  name: string;

  @Field()
  @MinLength(10)
  phoneNum: string;

  @Field(() => Int)
  @IsNotEmpty()
  courseId: number;

  @Field()
  school: string;
}
