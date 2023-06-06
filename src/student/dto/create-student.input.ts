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
  school: string;

  constructor(name: string, phoneNum: string, courseId: number) {
    this.name = name;
    this.phoneNum = phoneNum;
    this.courseId = courseId;
    this.school = '';
  }

  static of(
    name: string,
    phoneNum: string,
    courseId: number,
  ): CreateStudentInput {
    return new CreateStudentInput(name, phoneNum, courseId);
  }
}
