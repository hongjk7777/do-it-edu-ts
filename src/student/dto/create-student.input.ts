import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class CreateStudentInput {
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
  @IsNotEmpty()
  school: string;
}
