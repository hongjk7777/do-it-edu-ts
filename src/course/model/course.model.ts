import { BaseModel } from '@common/model/base.model';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Course extends BaseModel {
  @Field(() => String)
  name: string;
}
