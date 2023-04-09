import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsPhoneNumber, MinLength } from 'class-validator';
import { BaseModel } from 'src/common/model/base.model';

@InputType()
export class CreateStudentInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field()
  @MinLength(10)
  phoneNum: string;

  @Field(() => ID)
  @IsNotEmpty()
  courseId: number;

  @Field()
  @IsNotEmpty()
  school: string;
}
