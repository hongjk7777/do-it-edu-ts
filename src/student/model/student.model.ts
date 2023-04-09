import { Field, Int, ObjectType } from '@nestjs/graphql';
import { BaseModel } from 'src/common/model/base.model';

@ObjectType()
export class Student extends BaseModel {
  @Field(() => String)
  name: string;

  @Field(() => String)
  phoneNum: string;

  @Field(() => Int)
  courseId: number;

  @Field(() => String, { nullable: true })
  school: string;
}
