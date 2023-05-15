import { BaseModel } from '@common/model/base.model';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Course extends BaseModel {
  @Field(() => String)
  name: string;

  @Field(() => Int)
  studentCount: number;

  @Field(() => Int)
  examCount: number;
}
