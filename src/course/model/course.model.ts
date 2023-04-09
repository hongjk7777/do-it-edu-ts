import { Field, ObjectType } from '@nestjs/graphql';
import { BaseModel } from 'src/common/model/base.model';

@ObjectType()
export class Course extends BaseModel {
  @Field(() => String)
  name: string;
}
