import { BaseModel } from '@common/model/base.model';
import { Field, Int, ObjectType } from '@nestjs/graphql';

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
